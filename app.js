/* ============================================================
   ADVENTURE FUEL — COMMAND CENTER (live, Supabase-backed)
   Engine model: WORKFLOW -> STAGE -> REQUIREMENT -> EVIDENCE ->
   VERIFICATION -> DECISION -> HANDOFF -> MEASUREMENT
   Sales is the first workflow loaded into the engine.
   ============================================================ */
(function(){
"use strict";

/* ---------------------------------------------------------- */
/* SUPABASE                                                     */
/* ---------------------------------------------------------- */
// The anon/publishable key is designed to be public — real access
// control lives in Postgres Row Level Security, not in this file.
const SUPABASE_URL = "https://cjixvpcoivfipmgmvomi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r9lGmmPly-_NzXnM0pOUSA_X_7V1pJh";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------------------------------------------------- */
/* UTIL                                                         */
/* ---------------------------------------------------------- */
const DAY = 86400000;
const nowTs = () => Date.now();
const uid = (p) => p + "_" + Math.random().toString(36).slice(2,9);
const esc = (s) => String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const relTime = (ts) => {
  if(!ts) return "";
  const diff = nowTs() - ts;
  const d = Math.floor(diff/DAY);
  if(d <= 0){ const h = Math.floor(diff/3600000); return h<=0 ? "just now" : h+"h ago"; }
  if(d === 1) return "yesterday";
  return d+"d ago";
};
const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});
function toast(msg, kind){
  const host = document.getElementById("toastHost");
  const el = document.createElement("div");
  el.className = "toast" + (kind==="orange" ? " orange" : "");
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transition="opacity .25s"; setTimeout(()=>el.remove(), 260); }, 3200);
}
const DIM_LABEL = {process:"Process", quality:"Quality", growth:"Growth"};

/* ---------------------------------------------------------- */
/* STATE                                                        */
/* ---------------------------------------------------------- */
let STAGES = [];              // [{id,name,order}] — Sales
let ONB_STAGES = [];          // [{id,name,order}] — Onboarding
let ACC_STAGES = [];          // [{id,name,order}] — Clients (ongoing account management)
let STATE = {
  session:null, profile:null,     // {id, fullName, role}
  profiles:{},                    // id -> {fullName, role, email}
  requirements:{},                // stageId -> [{id,label,dims,required,dept,thresholdDays,sortOrder}] (shared across workflows — stage ids are unique)
  opportunities:[],
  clients:[],
  accounts:[],
  ui:{ view:"command", qDim:"all", search:"" }
};
const ALL_STAGE_ARRS = () => [STAGES, ONB_STAGES, ACC_STAGES];
function stagesArrFor(stageId){ return ALL_STAGE_ARRS().find(arr=>arr.some(s=>s.id===stageId)) || STAGES; }
function nextStageId(id){ const arr = stagesArrFor(id); const order = arr.map(s=>s.id); const i = order.indexOf(id); return i>=0 && i<order.length-1 ? order[i+1] : null; }
function stageName(id){ for(const arr of ALL_STAGE_ARRS()){ const s = arr.find(x=>x.id===id); if(s) return s.name; } return id; }
function getOpp(id){ return STATE.opportunities.find(o=>o.id===id); }
function getClient(id){ return STATE.clients.find(c=>c.id===id); }
function getAccount(id){ return STATE.accounts.find(a=>a.id===id); }
function getRecord(id, type){ return type==="account" ? getAccount(id) : type==="client" ? getClient(id) : getOpp(id); }
function reqConfig(stageId, reqId){ return (STATE.requirements[stageId]||[]).find(r=>r.id===reqId); }
function stageReqs(stageId){ return STATE.requirements[stageId]||[]; }
function daysInStage(o){ return Math.floor((nowTs()-o.stageEnteredAt)/DAY); }
function actorName(){ return STATE.profile ? STATE.profile.fullName : "Someone"; }
function dimsLabel(stageId, reqId){ const c = reqConfig(stageId, reqId); return c ? c.dims.map(d=>DIM_LABEL[d]).join(", ") : ""; }

/* ---------------------------------------------------------- */
/* DATA LAYER — Supabase reads                                  */
/* ---------------------------------------------------------- */
async function loadEngineConfig(){
  const [{data: stages, error: se}, {data: reqs, error: re}] = await Promise.all([
    sb.from("stages").select("*").order("sort_order"),
    sb.from("requirements").select("*").order("sort_order")
  ]);
  if(se || re){ console.error(se||re); toast("Couldn't load workflow config.", "orange"); return; }
  STAGES = (stages||[]).filter(s=>s.workflow_id==="sales").map(s=>({id:s.id, name:s.name, order:s.sort_order}));
  ONB_STAGES = (stages||[]).filter(s=>s.workflow_id==="onboarding").map(s=>({id:s.id, name:s.name, order:s.sort_order}));
  ACC_STAGES = (stages||[]).filter(s=>s.workflow_id==="accounts").map(s=>({id:s.id, name:s.name, order:s.sort_order}));
  const grouped = {};
  (reqs||[]).forEach(r=>{
    (grouped[r.stage_id] = grouped[r.stage_id]||[]).push({
      id:r.id, label:r.label, dims:r.dims||[], required:r.required, dept:r.dept,
      thresholdDays:r.threshold_days, sortOrder:r.sort_order
    });
  });
  STATE.requirements = grouped;
}

async function loadProfiles(){
  const {data, error} = await sb.from("profiles").select("*");
  if(error){ console.error(error); return; }
  const map = {};
  (data||[]).forEach(p=>{ map[p.id] = {fullName:p.full_name, role:p.role}; });
  STATE.profiles = map;
}

async function loadOpportunities(){
  const {data, error} = await sb.from("opportunities")
    .select("*, requirement_status(*), activity_log(*)")
    .order("created_at", {ascending:false});
  if(error){ console.error(error); toast("Couldn't load opportunities.", "orange"); return; }
  STATE.opportunities = (data||[]).map(o=>{
    const reqStatus = {};
    (o.requirement_status||[]).forEach(rs=>{
      reqStatus[rs.requirement_id] = {
        status: rs.status,
        evidence: rs.evidence,
        verifiedBy: rs.verified_by ? (STATE.profiles[rs.verified_by]||{}).fullName || "a teammate" : null,
        verifiedAt: rs.verified_at ? new Date(rs.verified_at).getTime() : null,
        blockedReason: rs.blocked_reason,
        updatedAt: new Date(rs.updated_at).getTime()
      };
    });
    const activity = (o.activity_log||[])
      .map(a=>({ts:new Date(a.created_at).getTime(), actor:a.actor_name, action:a.action, detail:a.detail||""}))
      .sort((a,b)=>b.ts-a.ts);
    return {
      id:o.id, business:o.business, contact:o.contact, source:o.source, value:Number(o.value),
      stageId:o.stage_id, stageEnteredAt:new Date(o.stage_entered_at).getTime(), createdAt:new Date(o.created_at).getTime(),
      status:o.status, lostReason:o.lost_reason, reqStatus, activity
    };
  });
}

async function loadClients(){
  const {data, error} = await sb.from("clients")
    .select("*, client_requirement_status(*), activity_log(*)")
    .order("created_at", {ascending:false});
  if(error){ console.error(error); toast("Couldn't load onboarding clients.", "orange"); return; }
  STATE.clients = (data||[]).map(c=>{
    const reqStatus = {};
    (c.client_requirement_status||[]).forEach(rs=>{
      reqStatus[rs.requirement_id] = {
        status: rs.status,
        evidence: rs.evidence,
        verifiedBy: rs.verified_by ? (STATE.profiles[rs.verified_by]||{}).fullName || "a teammate" : null,
        verifiedAt: rs.verified_at ? new Date(rs.verified_at).getTime() : null,
        blockedReason: rs.blocked_reason,
        updatedAt: new Date(rs.updated_at).getTime()
      };
    });
    const activity = (c.activity_log||[])
      .map(a=>({ts:new Date(a.created_at).getTime(), actor:a.actor_name, action:a.action, detail:a.detail||""}))
      .sort((a,b)=>b.ts-a.ts);
    return {
      id:c.id, business:c.business, contact:c.contact, value:Number(c.value),
      stageId:c.stage_id, stageEnteredAt:new Date(c.stage_entered_at).getTime(), createdAt:new Date(c.created_at).getTime(),
      status:c.status, sourceOpportunityId:c.source_opportunity_id, reqStatus, activity
    };
  });
}

async function loadAccounts(){
  const {data, error} = await sb.from("accounts")
    .select("*, account_requirement_status(*), activity_log(*)")
    .order("created_at", {ascending:false});
  if(error){ console.error(error); toast("Couldn't load client accounts.", "orange"); return; }
  STATE.accounts = (data||[]).map(a=>{
    const reqStatus = {};
    (a.account_requirement_status||[]).forEach(rs=>{
      reqStatus[rs.requirement_id] = {
        status: rs.status,
        evidence: rs.evidence,
        verifiedBy: rs.verified_by ? (STATE.profiles[rs.verified_by]||{}).fullName || "a teammate" : null,
        verifiedAt: rs.verified_at ? new Date(rs.verified_at).getTime() : null,
        blockedReason: rs.blocked_reason,
        updatedAt: new Date(rs.updated_at).getTime()
      };
    });
    const activity = (a.activity_log||[])
      .map(x=>({ts:new Date(x.created_at).getTime(), actor:x.actor_name, action:x.action, detail:x.detail||""}))
      .sort((x,y)=>y.ts-x.ts);
    return {
      id:a.id, business:a.business, contact:a.contact, value:Number(a.value),
      stageId:a.stage_id, stageEnteredAt:new Date(a.stage_entered_at).getTime(), createdAt:new Date(a.created_at).getTime(),
      status:a.status, cycleNumber:a.cycle_number, sourceClientId:a.source_client_id, reqStatus, activity
    };
  });
}

async function refreshAll(){
  await loadProfiles();
  await loadEngineConfig();
  await loadOpportunities();
  await loadClients();
  await loadAccounts();
}

/* ---------------------------------------------------------- */
/* DATA LAYER — mutations                                       */
/* ---------------------------------------------------------- */
async function logActivity(oppId, action, detail){
  await sb.from("activity_log").insert({
    opportunity_id: oppId, actor_id: STATE.session.user.id, actor_name: actorName(),
    action, detail: detail || null
  });
}
async function ensureReqRows(stageId, opportunityId){
  const reqs = stageReqs(stageId);
  if(!reqs.length) return;
  const rows = reqs.map(r=>({opportunity_id:opportunityId, requirement_id:r.id, status:"pending"}));
  await sb.from("requirement_status").upsert(rows, {onConflict:"opportunity_id,requirement_id", ignoreDuplicates:true});
}
async function ensureNewRequirementRows(stageId, requirementId){
  const {data: opps} = await sb.from("opportunities").select("id").eq("stage_id", stageId).eq("status","active");
  if(opps && opps.length){
    const rows = opps.map(o=>({opportunity_id:o.id, requirement_id:requirementId, status:"pending"}));
    await sb.from("requirement_status").upsert(rows, {onConflict:"opportunity_id,requirement_id", ignoreDuplicates:true});
  }
  const {data: clis} = await sb.from("clients").select("id").eq("stage_id", stageId).eq("status","active");
  if(clis && clis.length){
    const rows = clis.map(c=>({client_id:c.id, requirement_id:requirementId, status:"pending"}));
    await sb.from("client_requirement_status").upsert(rows, {onConflict:"client_id,requirement_id", ignoreDuplicates:true});
  }
  const {data: accs} = await sb.from("accounts").select("id").eq("stage_id", stageId).eq("status","active");
  if(accs && accs.length){
    const rows = accs.map(a=>({account_id:a.id, requirement_id:requirementId, status:"pending"}));
    await sb.from("account_requirement_status").upsert(rows, {onConflict:"account_id,requirement_id", ignoreDuplicates:true});
  }
}

async function submitEvidence(oppId, reqId, text){
  const cfg = reqConfig(getOpp(oppId).stageId, reqId);
  const {error} = await sb.from("requirement_status")
    .update({status:"submitted", evidence:text, updated_at:new Date().toISOString()})
    .eq("opportunity_id", oppId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't save that.", "orange"); return; }
  await logActivity(oppId, "Submitted evidence: "+cfg.label, cfg.dims.map(d=>DIM_LABEL[d]).join(", "));
  toast("Evidence submitted — awaiting verification.");
  await refreshAndRerender();
}
async function verifyReq(oppId, reqId){
  const cfg = reqConfig(getOpp(oppId).stageId, reqId);
  const {error} = await sb.from("requirement_status")
    .update({status:"verified", verified_by:STATE.session.user.id, verified_at:new Date().toISOString(), updated_at:new Date().toISOString()})
    .eq("opportunity_id", oppId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't verify that.", "orange"); return; }
  await logActivity(oppId, "Verified: "+cfg.label, cfg.dims.map(d=>DIM_LABEL[d]).join(", "));
  toast("Verified.");
  await refreshAndRerender();
}
async function flagReq(oppId, reqId, reason){
  const cfg = reqConfig(getOpp(oppId).stageId, reqId);
  const {error} = await sb.from("requirement_status")
    .update({status:"blocked", blocked_reason: reason || "Flagged — needs a closer look.", updated_at:new Date().toISOString()})
    .eq("opportunity_id", oppId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't flag that.", "orange"); return; }
  await logActivity(oppId, "Flagged: "+cfg.label, reason);
  toast("Flagged as a blocker.", "orange");
  await refreshAndRerender();
}
async function resolveReq(oppId, reqId){
  const cfg = reqConfig(getOpp(oppId).stageId, reqId);
  const {error} = await sb.from("requirement_status")
    .update({status:"pending", blocked_reason:null, updated_at:new Date().toISOString()})
    .eq("opportunity_id", oppId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't reopen that.", "orange"); return; }
  await logActivity(oppId, "Reopened for review: "+cfg.label, "");
  toast("Sent back for fresh evidence.");
  await refreshAndRerender();
}
async function advanceStage(oppId){
  const o = getOpp(oppId);
  const a = analyzeStage(o);
  if(!a.allRequiredVerified){ toast("Can't advance — required gates still open.", "orange"); return; }
  const next = nextStageId(o.stageId);
  if(!next) return;
  await ensureReqRows(next, oppId);
  const {error} = await sb.from("opportunities")
    .update({stage_id:next, stage_entered_at:new Date().toISOString()})
    .eq("id", oppId);
  if(error){ toast("Couldn't advance that.", "orange"); return; }
  await logActivity(oppId, "Advanced to "+stageName(next), "All required gates cleared.");
  toast("Advanced to "+stageName(next)+".");
  await refreshAndRerender();
}
async function markLost(oppId, reason){
  const {error} = await sb.from("opportunities").update({status:"lost", lost_reason: reason || "Marked lost."}).eq("id", oppId);
  if(error){ toast("Couldn't update that.", "orange"); return; }
  await logActivity(oppId, "Marked Lost", reason || "Marked lost.");
  toast("Marked as lost.", "orange");
  await refreshAndRerender();
}
async function toggleHandoff(oppId, reqId){
  const o = getOpp(oppId);
  const cfg = reqConfig(o.stageId, reqId);
  const cur = o.reqStatus[reqId];
  if(cur.status==="verified"){
    await sb.from("requirement_status").update({status:"pending", verified_by:null, verified_at:null}).eq("opportunity_id",oppId).eq("requirement_id",reqId);
    await logActivity(oppId, "Unchecked: "+cfg.label, "");
  } else {
    await sb.from("requirement_status").update({status:"verified", evidence:"Confirmed by "+actorName(), verified_by:STATE.session.user.id, verified_at:new Date().toISOString()}).eq("opportunity_id",oppId).eq("requirement_id",reqId);
    await logActivity(oppId, "Checked off: "+cfg.label, "");
  }
  await refreshAndRerender();
}
async function sendHandoff(oppId){
  const o = getOpp(oppId);
  const a = analyzeStage(o);
  if(!a.allRequiredVerified){ toast("Handoff package isn't complete yet.", "orange"); return; }
  const {error} = await sb.from("opportunities").update({status:"handed_off"}).eq("id", oppId);
  if(error){ toast("Couldn't send that.", "orange"); return; }
  await logActivity(oppId, "Sent to Flow", "Full handoff package delivered — client now in delivery.");
  toast("Sent to Flow. \u{1F3C1}");
  await refreshAndRerender();
}
async function createOpportunity(fields){
  const stageId = STAGES[0].id;
  const {data, error} = await sb.from("opportunities").insert({
    business: fields.business, contact: fields.contact, source: fields.source,
    value: Number(fields.value)||0, stage_id: stageId, created_by: STATE.session.user.id
  }).select().single();
  if(error){ toast("Couldn't create that opportunity.", "orange"); return; }
  await ensureReqRows(stageId, data.id);
  await logActivity(data.id, "Opportunity created", "Source: "+fields.source);
  toast("Opportunity created.");
  await refreshAndRerender();
}

async function addRequirement(stageId, label){
  const {data, error} = await sb.from("requirements").insert({
    stage_id: stageId, label, dims:["process"], required:true, dept:"Hunter", threshold_days:3,
    sort_order: (stageReqs(stageId).length + 1)
  }).select().single();
  if(error){ toast("Couldn't add that — admin only.", "orange"); return; }
  await ensureNewRequirementRows(stageId, data.id);
  toast("Requirement added — live on every open opportunity.");
  await refreshAndRerender();
}
async function deleteRequirement(reqId){
  const {error} = await sb.from("requirements").delete().eq("id", reqId);
  if(error){ toast("Couldn't remove that.", "orange"); return; }
  toast("Requirement removed.", "orange");
  await refreshAndRerender();
}
async function toggleDim(reqId, dim){
  const cfg = Object.values(STATE.requirements).flat().find(r=>r.id===reqId);
  const dims = cfg.dims.includes(dim) ? cfg.dims.filter(d=>d!==dim) : [...cfg.dims, dim];
  const {error} = await sb.from("requirements").update({dims}).eq("id", reqId);
  if(error){ toast("Couldn't update that.", "orange"); return; }
  await refreshAndRerender();
}
async function toggleRequired(reqId, required){
  const {error} = await sb.from("requirements").update({required}).eq("id", reqId);
  if(error){ toast("Couldn't update that.", "orange"); return; }
  await refreshAndRerender();
}
async function updateTeamRole(profileId, role){
  const {error} = await sb.from("profiles").update({role}).eq("id", profileId);
  if(error){ toast("Couldn't update that teammate's role.", "orange"); return; }
  toast("Role updated.");
  await refreshAndRerender();
}

/* ---------------- Onboarding / clients mutations ---------------- */
async function logClientActivity(clientId, action, detail){
  await sb.from("activity_log").insert({
    client_id: clientId, actor_id: STATE.session.user.id, actor_name: actorName(),
    action, detail: detail || null
  });
}
async function ensureClientReqRows(stageId, clientId){
  const reqs = stageReqs(stageId);
  if(!reqs.length) return;
  const rows = reqs.map(r=>({client_id:clientId, requirement_id:r.id, status:"pending"}));
  await sb.from("client_requirement_status").upsert(rows, {onConflict:"client_id,requirement_id", ignoreDuplicates:true});
}
async function submitClientEvidence(clientId, reqId, text){
  const cfg = reqConfig(getClient(clientId).stageId, reqId);
  const {error} = await sb.from("client_requirement_status")
    .update({status:"submitted", evidence:text, updated_at:new Date().toISOString()})
    .eq("client_id", clientId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't save that.", "orange"); return; }
  await logClientActivity(clientId, "Submitted evidence: "+cfg.label, cfg.dims.map(d=>DIM_LABEL[d]).join(", "));
  toast("Evidence submitted — awaiting verification.");
  await refreshAndRerender();
}
async function verifyClientReq(clientId, reqId){
  const cfg = reqConfig(getClient(clientId).stageId, reqId);
  const {error} = await sb.from("client_requirement_status")
    .update({status:"verified", verified_by:STATE.session.user.id, verified_at:new Date().toISOString(), updated_at:new Date().toISOString()})
    .eq("client_id", clientId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't verify that.", "orange"); return; }
  await logClientActivity(clientId, "Verified: "+cfg.label, cfg.dims.map(d=>DIM_LABEL[d]).join(", "));
  toast("Verified.");
  await refreshAndRerender();
}
async function flagClientReq(clientId, reqId, reason){
  const cfg = reqConfig(getClient(clientId).stageId, reqId);
  const {error} = await sb.from("client_requirement_status")
    .update({status:"blocked", blocked_reason: reason || "Flagged — needs a closer look.", updated_at:new Date().toISOString()})
    .eq("client_id", clientId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't flag that.", "orange"); return; }
  await logClientActivity(clientId, "Flagged: "+cfg.label, reason);
  toast("Flagged as a blocker.", "orange");
  await refreshAndRerender();
}
async function resolveClientReq(clientId, reqId){
  const cfg = reqConfig(getClient(clientId).stageId, reqId);
  const {error} = await sb.from("client_requirement_status")
    .update({status:"pending", blocked_reason:null, updated_at:new Date().toISOString()})
    .eq("client_id", clientId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't reopen that.", "orange"); return; }
  await logClientActivity(clientId, "Reopened for review: "+cfg.label, "");
  toast("Sent back for fresh evidence.");
  await refreshAndRerender();
}
async function advanceClientStage(clientId){
  const c = getClient(clientId);
  const a = analyzeStage(c);
  if(!a.allRequiredVerified){ toast("Can't advance — required gates still open.", "orange"); return; }
  const next = nextStageId(c.stageId);
  if(!next) return;
  await ensureClientReqRows(next, clientId);
  const {error} = await sb.from("clients")
    .update({stage_id:next, stage_entered_at:new Date().toISOString()})
    .eq("id", clientId);
  if(error){ toast("Couldn't advance that.", "orange"); return; }
  await logClientActivity(clientId, "Advanced to "+stageName(next), "All required gates cleared.");
  toast("Advanced to "+stageName(next)+".");
  await refreshAndRerender();
}
async function markClientLive(clientId){
  const c = getClient(clientId);
  const a = analyzeStage(c);
  if(!a.allRequiredVerified){ toast("Not ready yet — required gates still open.", "orange"); return; }
  const {error} = await sb.from("clients").update({status:"live"}).eq("id", clientId);
  if(error){ toast("Couldn't update that.", "orange"); return; }
  await logClientActivity(clientId, "Marked Live", "Onboarding complete — client is now live.");
  toast("Client is live. \u{1F3C1}");
  await refreshAndRerender();
}

/* ---------------- Clients / accounts mutations (ongoing, cyclical) ---------------- */
async function logAccountActivity(accountId, action, detail){
  await sb.from("activity_log").insert({
    account_id: accountId, actor_id: STATE.session.user.id, actor_name: actorName(),
    action, detail: detail || null
  });
}
async function ensureAccountReqRows(stageId, accountId){
  const reqs = stageReqs(stageId);
  if(!reqs.length) return;
  const rows = reqs.map(r=>({account_id:accountId, requirement_id:r.id, status:"pending"}));
  await sb.from("account_requirement_status").upsert(rows, {onConflict:"account_id,requirement_id", ignoreDuplicates:true});
}
async function submitAccountEvidence(accountId, reqId, text){
  const cfg = reqConfig(getAccount(accountId).stageId, reqId);
  const {error} = await sb.from("account_requirement_status")
    .update({status:"submitted", evidence:text, updated_at:new Date().toISOString()})
    .eq("account_id", accountId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't save that.", "orange"); return; }
  await logAccountActivity(accountId, "Submitted evidence: "+cfg.label, cfg.dims.map(d=>DIM_LABEL[d]).join(", "));
  toast("Evidence submitted — awaiting verification.");
  await refreshAndRerender();
}
async function verifyAccountReq(accountId, reqId){
  const cfg = reqConfig(getAccount(accountId).stageId, reqId);
  const {error} = await sb.from("account_requirement_status")
    .update({status:"verified", verified_by:STATE.session.user.id, verified_at:new Date().toISOString(), updated_at:new Date().toISOString()})
    .eq("account_id", accountId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't verify that.", "orange"); return; }
  await logAccountActivity(accountId, "Verified: "+cfg.label, cfg.dims.map(d=>DIM_LABEL[d]).join(", "));
  toast("Verified.");
  await refreshAndRerender();
}
async function flagAccountReq(accountId, reqId, reason){
  const cfg = reqConfig(getAccount(accountId).stageId, reqId);
  const {error} = await sb.from("account_requirement_status")
    .update({status:"blocked", blocked_reason: reason || "Flagged — needs a closer look.", updated_at:new Date().toISOString()})
    .eq("account_id", accountId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't flag that.", "orange"); return; }
  await logAccountActivity(accountId, "Flagged: "+cfg.label, reason);
  toast("Flagged as a blocker.", "orange");
  await refreshAndRerender();
}
async function resolveAccountReq(accountId, reqId){
  const cfg = reqConfig(getAccount(accountId).stageId, reqId);
  const {error} = await sb.from("account_requirement_status")
    .update({status:"pending", blocked_reason:null, updated_at:new Date().toISOString()})
    .eq("account_id", accountId).eq("requirement_id", reqId);
  if(error){ toast("Couldn't reopen that.", "orange"); return; }
  await logAccountActivity(accountId, "Reopened for review: "+cfg.label, "");
  toast("Sent back for fresh evidence.");
  await refreshAndRerender();
}
async function advanceAccountStage(accountId){
  const a = getAccount(accountId);
  const an = analyzeStage(a);
  if(!an.allRequiredVerified){ toast("Can't advance — required gates still open.", "orange"); return; }
  const next = nextStageId(a.stageId);
  if(!next) return;
  await ensureAccountReqRows(next, accountId);
  const {error} = await sb.from("accounts")
    .update({stage_id:next, stage_entered_at:new Date().toISOString()})
    .eq("id", accountId);
  if(error){ toast("Couldn't advance that.", "orange"); return; }
  await logAccountActivity(accountId, "Advanced to "+stageName(next), "All required gates cleared.");
  toast("Advanced to "+stageName(next)+".");
  await refreshAndRerender();
}
async function completeAccountCycle(accountId){
  const a = getAccount(accountId);
  const an = analyzeStage(a);
  if(!an.allRequiredVerified){ toast("Not ready yet — required gates still open.", "orange"); return; }
  const firstStage = ACC_STAGES[0].id;
  const {error: e1} = await sb.from("account_requirement_status")
    .update({status:"pending", evidence:null, verified_by:null, verified_at:null, blocked_reason:null, updated_at:new Date().toISOString()})
    .eq("account_id", accountId);
  if(e1){ toast("Couldn't reset that cycle.", "orange"); return; }
  const cycleNum = a.cycleNumber || 1;
  const {error: e2} = await sb.from("accounts")
    .update({stage_id:firstStage, stage_entered_at:new Date().toISOString(), cycle_number:cycleNum+1})
    .eq("id", accountId);
  if(e2){ toast("Couldn't update that.", "orange"); return; }
  await logAccountActivity(accountId, "Completed Cycle "+cycleNum, "Starting Cycle "+(cycleNum+1)+".");
  toast("Cycle complete — new cycle started. \u{1F501}");
  await refreshAndRerender();
}

/* ---------------------------------------------------------- */
/* ANALYSIS (pure — unchanged shape from the prototype)          */
/* ---------------------------------------------------------- */
function analyzeStage(o){
  const cfgs = stageReqs(o.stageId);
  const days = daysInStage(o);
  const items = cfgs.map(cfg=>{
    const st = o.reqStatus[cfg.id] || {status:"pending"};
    let severity = "ok";
    if(st.status === "blocked") severity = "critical";
    else if(cfg.required && st.status !== "verified" && days > cfg.thresholdDays) severity = "critical";
    else if(st.status === "submitted") severity = "info";
    return {reqId:cfg.id, cfg, state:st, severity};
  });
  const allRequiredVerified = cfgs.filter(c=>c.required).every(c => (o.reqStatus[c.id]||{}).status === "verified");
  const hasCritical = items.some(i=>i.severity==="critical");
  return {items, allRequiredVerified, hasCritical};
}
function activeRecords(){
  return [
    ...STATE.opportunities.filter(o=>o.status==="active").map(o=>({o, type:"opportunity"})),
    ...STATE.clients.filter(c=>c.status==="active").map(o=>({o, type:"client"})),
    ...STATE.accounts.filter(a=>a.status==="active").map(o=>({o, type:"account"}))
  ];
}
function fuelGaugeData(){
  let judged=0, verified=0, criticalInstances=0;
  const criticalOppIds = new Set();
  activeRecords().forEach(({o})=>{
    const a = analyzeStage(o);
    a.items.forEach(it=>{
      if(!it.cfg.required) return;
      if(it.state.status==="verified"){ judged++; verified++; }
      else if(it.severity==="critical"){ judged++; criticalInstances++; criticalOppIds.add(o.id); }
    });
  });
  let score = judged === 0 ? 100 : Math.round((verified/judged)*100);
  score = score - criticalOppIds.size*5;
  score = Math.min(100, Math.max(0, score));
  let zone = "critical", zoneLabel="STALLED";
  if(score >= 75){ zone="blue"; zoneLabel="FULL SEND"; }
  else if(score >= 40){ zone="orange"; zoneLabel="RUNNING"; }
  return {score, zone, zoneLabel, critical:criticalInstances, criticalOpps:criticalOppIds.size, judged, verified};
}

/* ---------------------------------------------------------- */
/* GAUGE SVG                                                     */
/* ---------------------------------------------------------- */
function polar(cx,cy,r,deg){ const rad=(deg-180)*Math.PI/180; return {x:cx+r*Math.cos(rad), y:cy+r*Math.sin(rad)}; }
function arcPath(cx,cy,r,startDeg,endDeg){
  const s = polar(cx,cy,r,startDeg), e = polar(cx,cy,r,endDeg);
  const large = (endDeg-startDeg) > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}
function gaugeSVG(score, zone, size){
  const w = size||220, h = w*0.62, cx=w/2, cy=h-6, r=w*0.42, r2=r-15;
  const trackPath = arcPath(cx,cy,r,0,180);
  const redlinePath = arcPath(cx,cy,r,0,24);
  const needleDeg = Math.min(179, Math.max(1,(score/100)*180));
  const tip = polar(cx,cy,r2,needleDeg);
  const zoneColor = {critical:"var(--critical)", orange:"var(--fuel)", blue:"var(--signal)"}[zone];
  const ticks = [0,45,90,135,180].map(d=>{
    const p1 = polar(cx,cy,r+7,d), p2 = polar(cx,cy,r+1,d);
    return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="var(--paper-faint)" stroke-width="2"/>`;
  }).join("");
  const eLbl = polar(cx,cy,r+19,0), fLbl = polar(cx,cy,r+19,180);
  return `
  <svg width="${w}" height="${h+34}" viewBox="0 0 ${w} ${h+34}">
    <path d="${trackPath}" fill="none" stroke="var(--line)" stroke-width="9" stroke-linecap="round"/>
    <path d="${redlinePath}" fill="none" stroke="var(--critical)" stroke-width="9" stroke-linecap="round" opacity=".9"/>
    ${ticks}
    <text x="${eLbl.x.toFixed(1)}" y="${(eLbl.y+4).toFixed(1)}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--critical)">E</text>
    <text x="${fLbl.x.toFixed(1)}" y="${(fLbl.y+4).toFixed(1)}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="var(--signal)">F</text>
    <line x1="${cx}" y1="${cy}" x2="${tip.x.toFixed(2)}" y2="${tip.y.toFixed(2)}" stroke="${zoneColor}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="${zoneColor}"/>
    <text x="${cx}" y="${h+18}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="22" fill="var(--paper)">${score}</text>
    <text x="${cx}" y="${h+32}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" letter-spacing="1.5" fill="var(--paper-faint)">FUEL LEVEL</text>
  </svg>`;
}

/* ---------------------------------------------------------- */
/* NAV + VIEW ROUTING                                            */
/* ---------------------------------------------------------- */
const NAV_LIVE = [
  {id:"command", label:"Command Center", glyph:"⌁"},
  {id:"sales",   label:"Sales",          glyph:"↗"},
  {id:"quality", label:"Quality",        glyph:"✓"}
];
const NAV_LIVE_V2 = [
  {id:"onboarding", label:"Onboarding", glyph:"\u{1F6E0}"},
  {id:"accounts",   label:"Clients",    glyph:"\u{1F91D}"}
];
const NAV_ADMIN = [
  {id:"admin", label:"SOP Gates", glyph:"⚙"},
  {id:"team",  label:"Team",      glyph:"⛁"}
];
const NAV_V2 = [
  {id:"campaigns",label:"Campaigns"},
  {id:"content",label:"Content"},{id:"reporting",label:"Reporting"},{id:"automations",label:"Automations"}
];
const NAV_V3 = [
  {id:"reviews",label:"Dept. Reviews"},{id:"evidence",label:"Evidence Analysis"},{id:"exec",label:"Executive Summary"}
];
const PAGE_META = {
  command:{kicker:"ADVENTURE FUEL OS", title:"COMMAND CENTER"},
  sales:{kicker:"HUNTER", title:"SALES WORKFLOW"},
  quality:{kicker:"PROCESS · QUALITY · GROWTH", title:"VERIFICATION QUEUE"},
  onboarding:{kicker:"FLOW", title:"ONBOARDING WORKFLOW"},
  accounts:{kicker:"GROW", title:"CLIENT WORKFLOW"},
  admin:{kicker:"ADMIN — WORKFLOW ENGINE", title:"SOP GATES"},
  team:{kicker:"ADMIN — WORKFLOW ENGINE", title:"TEAM"}
};

function renderNav(){
  const nav = document.getElementById("nav");
  const isAdmin = STATE.profile && STATE.profile.role === "admin";
  let html = `<div class="nav-group-label">Live — V1</div>`;
  NAV_LIVE.forEach(item=>{ html += navBtn(item, STATE.ui.view===item.id, false, null); });
  if(isAdmin) NAV_ADMIN.forEach(item=>{ html += navBtn(item, STATE.ui.view===item.id, false, null); });
  html += `<div class="nav-group-label">Live — V2</div>`;
  NAV_LIVE_V2.forEach(item=>{ html += navBtn(item, STATE.ui.view===item.id, false, null); });
  html += `<div class="nav-group-label">V2 — Workflow Engine</div>`;
  NAV_V2.forEach(item=>{ html += navBtn(item, false, true, "V2"); });
  html += `<div class="nav-group-label">V3 — Intelligence</div>`;
  NAV_V3.forEach(item=>{ html += navBtn(item, false, true, "V3"); });
  nav.innerHTML = html;
}
function navBtn(item, active, locked, tag){
  return `<button class="nav-btn ${active?"active":""} ${locked?"locked":""}" data-action="${locked?"roadmap":"nav"}" data-view="${item.id}" data-label="${esc(item.label)}">
    <span class="glyph">${item.glyph||"▪"}</span><span class="lbl">${esc(item.label)}</span>
    ${tag?`<span class="nav-tag">${tag}</span>`:""}
  </button>`;
}

function showView(viewId){
  STATE.ui.view = viewId;
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  const el = document.getElementById("view-"+(PAGE_META[viewId]?viewId:"roadmap"));
  if(el) el.classList.add("active");
  const meta = PAGE_META[viewId];
  document.getElementById("pageKicker").textContent = meta ? meta.kicker : "ROADMAP";
  document.getElementById("pageTitle").textContent = meta ? meta.title : "COMING NEXT";
  renderPageActions(viewId);
  renderNav();
  if(viewId==="command") renderCommand();
  if(viewId==="sales") renderSales();
  if(viewId==="quality") renderQuality();
  if(viewId==="onboarding") renderOnboarding();
  if(viewId==="accounts") renderAccounts();
  if(viewId==="admin") renderAdmin();
  if(viewId==="team") renderTeam();
}
function renderPageActions(viewId){
  const el = document.getElementById("pageActions");
  el.innerHTML = (viewId==="sales" || viewId==="command") ? `<button class="btn primary" data-action="open-new">+ NEW OPPORTUNITY</button>` : "";
}
function renderRoadmap(label){
  const V2_META = {
    clients:"Every active client's health, SLAs, and delivery status in one place — no spreadsheets.",
    onboarding:"The handoff Hunter just sent becomes a tracked onboarding workflow with its own SOP gates.",
    campaigns:"Meta campaign structure, budget, and pacing tracked with the same requirement engine.",
    content:"Content calendars and approvals routed through department ownership, not group chats.",
    reporting:"Monthly & quarterly reporting generated from verified evidence, not last-minute scrambling.",
    automations:"Atlas's automations — lead routing, reminders, and gate escalations — configured, not coded.",
    reviews:"Scout, Hunter, Fuel, Pulse & Flow each get an AI-assisted review pass on their own domain.",
    evidence:"Qualitative evidence — call notes, creative, reports — read for gaps automatically.",
    exec:"“3 things that need you” — a standing executive summary, generated, not compiled."
  };
  const isV3 = NAV_V3.some(i=>i.label===label);
  const key = [...NAV_V2, ...NAV_V3].find(i=>i.label===label);
  const desc = key && V2_META[key.id] ? V2_META[key.id] : "This module runs on the same engine as Sales — it just hasn't been loaded yet.";
  const allItems = [...NAV_V2.map(i=>({...i, v:"V2"})), ...NAV_V3.map(i=>({...i, v:"V3"}))];
  document.getElementById("roadmapContent").innerHTML = `
    <span class="tag pill ${isV3?"blue":"orange"}">${isV3?"V3 — INTELLIGENCE":"V2 — WORKFLOW ENGINE"}</span>
    <h2>${esc(label).toUpperCase()}<br>ISN'T LOADED YET.</h2>
    <p>${esc(desc)} Same engine — <span class="mono" style="color:var(--paper)">WORKFLOW → STAGE → REQUIREMENT → EVIDENCE → VERIFICATION → DECISION → HANDOFF → MEASUREMENT</span> — just a different workflow plugged in.</p>
    <div class="roadmap-grid">${allItems.map(i=>`<div class="roadmap-item"><b>${esc(i.label)}</b><span>${i.v}</span></div>`).join("")}</div>`;
  STATE.ui.view = "roadmap";
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-roadmap").classList.add("active");
  document.getElementById("pageKicker").textContent = "ROADMAP";
  document.getElementById("pageTitle").textContent = label.toUpperCase();
  document.getElementById("pageActions").innerHTML = "";
  renderNav();
}

/* ---------------------------------------------------------- */
/* COMMAND CENTER                                                */
/* ---------------------------------------------------------- */
function renderCommand(){
  const g = fuelGaugeData();
  document.getElementById("heroGauge").innerHTML = gaugeSVG(g.score, g.zone, 210) + `<div class="gauge-label" style="margin-top:2px">${g.zoneLabel}</div>`;

  const active = STATE.opportunities.filter(o=>o.status==="active");
  const won = STATE.opportunities.filter(o=>o.status==="handed_off").length;
  const lost = STATE.opportunities.filter(o=>o.status==="lost").length;
  const winRate = (won+lost) ? Math.round((won/(won+lost))*100) : 0;
  const pipelineValue = active.reduce((s,o)=>s+o.value,0);
  const avgDays = active.length ? Math.round(active.reduce((s,o)=>s+daysInStage(o),0)/active.length) : 0;

  let criticalGroups = [], verifyGroups = [], readyList = [];
  activeRecords().forEach(({o,type})=>{
    const a = analyzeStage(o);
    const crits = a.items.filter(i=>i.severity==="critical");
    const infos = a.items.filter(i=>i.severity==="info");
    if(crits.length) criticalGroups.push({o, type, items:crits, days:daysInStage(o)});
    if(infos.length) verifyGroups.push({o, type, items:infos});
    if(a.allRequiredVerified) readyList.push({o, type});
  });
  criticalGroups.sort((a,b)=>b.days-a.days);

  document.getElementById("metrics").innerHTML = `
    ${metricTile(active.length,"Open Opportunities")}
    ${metricTile(money(pipelineValue),"Pipeline Value")}
    ${metricTile(criticalGroups.length,"Critical Blockers", criticalGroups.length?"bad":"")}
    ${metricTile(verifyGroups.reduce((s,g)=>s+g.items.length,0),"Awaiting Verification", verifyGroups.length?"info":"")}
    ${metricTile(winRate+"%","Win Rate")}
    ${metricTile(avgDays+"d","Avg. Days In Stage")}
  `;

  const wfTag = (type)=> `<span class="pill neutral">${type==="client"?"ONBOARDING":type==="account"?"CLIENTS":"SALES"}</span>`;

  document.getElementById("critKicker").textContent = criticalGroups.length ? "CRITICAL · "+criticalGroups.length : "CRITICAL";
  document.getElementById("attention").innerHTML = criticalGroups.length ? criticalGroups.map(({o,type,items,days})=>{
    const dims = [...new Set(items.flatMap(i=>i.cfg.dims))];
    return `<div class="att-card critical">
      <div class="att-main">
        <div class="att-top"><span class="att-biz">${esc(o.business)}</span><span class="pill critical">${items.length} GATE${items.length>1?"S":""} BLOCKED</span><span class="pill neutral">${stageName(o.stageId)}</span>${wfTag(type)}${dimTags(dims)}</div>
        <div class="att-detail-list">${items.map(it=>`<div>${it.state.status==="blocked" ? "Flagged: "+esc(it.state.blockedReason||"") : esc(it.cfg.label)+" — "+days+"d in stage, "+it.cfg.thresholdDays+"d gate"}</div>`).join("")}</div>
      </div>
      <div class="att-side"><span class="att-value mono">${money(o.value)}</span><button class="btn small danger" data-action="open-deal" data-type="${type}" data-id="${o.id}">RESOLVE →</button></div>
    </div>`;
  }).join("") : `<div class="empty-state">NO CRITICAL BLOCKERS — CLEAN BOARD.</div>`;

  document.getElementById("verifyQueue").innerHTML = verifyGroups.length ? verifyGroups.slice(0,6).map(({o,type,items})=>{
    const dims = [...new Set(items.flatMap(i=>i.cfg.dims))];
    return `<div class="att-card blue">
      <div class="att-main">
        <div class="att-top"><span class="att-biz">${esc(o.business)}</span><span class="pill blue">${items.length} awaiting review</span>${wfTag(type)}${dimTags(dims)}</div>
        <div class="att-detail-list">${items.map(it=>`<div>${esc(it.cfg.label)}</div>`).join("")}</div>
      </div>
      <div class="att-side"><button class="btn small ghost-blue" data-action="open-deal" data-type="${type}" data-id="${o.id}">REVIEW →</button></div>
    </div>`;
  }).join("") : `<div class="empty-state">NOTHING WAITING ON YOU.</div>`;

  document.getElementById("readyList").innerHTML = readyList.length ? readyList.map(({o,type})=>{
    const next = nextStageId(o.stageId);
    const isOpp = type==="opportunity";
    const isFinal = isOpp && o.stageId==="handoff";
    let label, action;
    if(isFinal){ label = "SEND TO FLOW"; action = "send-handoff"; }
    else if(type==="client" && !next){ label = "MARK LIVE"; action = "mark-live"; }
    else if(type==="account" && !next){ label = "COMPLETE CYCLE"; action = "complete-cycle"; }
    else { label = "ADVANCE → "+stageName(next).toUpperCase(); action = "advance"; }
    return `<div class="ready-row">
      <div style="flex:1"><b>${esc(o.business)}</b> <span class="stage-arrow">· ${stageName(o.stageId)} gate clear</span> ${wfTag(type)}</div>
      <span class="att-value mono">${money(o.value)}</span>
      <button class="btn small primary" data-action="${action}" data-type="${type}" data-id="${o.id}">${label} →</button>
    </div>`;
  }).join("") : `<div class="empty-state">NOTHING READY RIGHT NOW.</div>`;
}
function metricTile(num,label,cls){ return `<div class="metric ${cls||""}"><div class="num mono">${num}</div><div class="lbl">${esc(label)}</div></div>`; }
function dimTags(dims){ return (dims||[]).map(d=>`<span class="dim-tag ${d}">${DIM_LABEL[d]}</span>`).join(""); }

/* ---------------------------------------------------------- */
/* SALES / PIPELINE                                              */
/* ---------------------------------------------------------- */
function renderSales(){
  const q = (STATE.ui.search||"").toLowerCase();
  const cols = STAGES.map(st=>{
    let deals = STATE.opportunities.filter(o=>o.stageId===st.id && o.status==="active");
    if(q) deals = deals.filter(o=>o.business.toLowerCase().includes(q) || o.contact.toLowerCase().includes(q));
    const value = deals.reduce((s,o)=>s+o.value,0);
    return `<div class="stage-col">
      <div class="stage-col-head"><b>${esc(st.name)}</b><div class="stage-meta"><span>${deals.length} OPEN</span><span>${money(value)}</span></div></div>
      <div class="stage-col-body">${deals.map(o=>dealCard(o)).join("") || `<div class="empty-state" style="padding:16px 10px;">EMPTY</div>`}</div>
    </div>`;
  }).join("");
  document.getElementById("pipeline").innerHTML = cols;
}
function dealCard(o){
  const a = analyzeStage(o);
  const critical = a.hasCritical;
  const badge = critical ? `<span class="pill critical">BLOCKED</span>` : a.allRequiredVerified ? `<span class="pill blue">READY</span>` : `<span class="pill neutral">IN PROGRESS</span>`;
  return `<button class="deal-card ${critical?"state-critical":""}" data-action="open-deal" data-type="opportunity" data-id="${o.id}">
    <div class="biz">${esc(o.business)}</div>
    <div class="contact">${esc(o.contact)} · ${esc(o.source)}</div>
    <div class="foot"><span class="value mono">${money(o.value)}</span>${badge}</div>
    <div class="days">${daysInStage(o)}D IN STAGE</div>
  </button>`;
}

/* ---------------------------------------------------------- */
/* ONBOARDING / CLIENTS PIPELINE                                 */
/* ---------------------------------------------------------- */
function renderOnboarding(){
  const cols = ONB_STAGES.map(st=>{
    const clis = STATE.clients.filter(c=>c.stageId===st.id && c.status==="active");
    const value = clis.reduce((s,c)=>s+c.value,0);
    return `<div class="stage-col">
      <div class="stage-col-head"><b>${esc(st.name)}</b><div class="stage-meta"><span>${clis.length} OPEN</span><span>${money(value)}</span></div></div>
      <div class="stage-col-body">${clis.map(c=>clientCard(c)).join("") || `<div class="empty-state" style="padding:16px 10px;">EMPTY</div>`}</div>
    </div>`;
  }).join("");
  document.getElementById("pipeline-onb").innerHTML = cols;
}
function clientCard(c){
  const a = analyzeStage(c);
  const critical = a.hasCritical;
  const badge = critical ? `<span class="pill critical">BLOCKED</span>` : a.allRequiredVerified ? `<span class="pill blue">READY</span>` : `<span class="pill neutral">IN PROGRESS</span>`;
  return `<button class="deal-card ${critical?"state-critical":""}" data-action="open-deal" data-type="client" data-id="${c.id}">
    <div class="biz">${esc(c.business)}</div>
    <div class="contact">${esc(c.contact)}</div>
    <div class="foot"><span class="value mono">${money(c.value)}</span>${badge}</div>
    <div class="days">${daysInStage(c)}D IN STAGE</div>
  </button>`;
}

/* ---------------------------------------------------------- */
/* CLIENTS / ONGOING ACCOUNT MANAGEMENT (cyclical)               */
/* ---------------------------------------------------------- */
function renderAccounts(){
  const cols = ACC_STAGES.map(st=>{
    const accs = STATE.accounts.filter(a=>a.stageId===st.id && a.status==="active");
    const value = accs.reduce((s,a)=>s+a.value,0);
    return `<div class="stage-col">
      <div class="stage-col-head"><b>${esc(st.name)}</b><div class="stage-meta"><span>${accs.length} OPEN</span><span>${money(value)}</span></div></div>
      <div class="stage-col-body">${accs.map(a=>accountCard(a)).join("") || `<div class="empty-state" style="padding:16px 10px;">EMPTY</div>`}</div>
    </div>`;
  }).join("");
  document.getElementById("pipeline-acc").innerHTML = cols;
}
function accountCard(a){
  const an = analyzeStage(a);
  const critical = an.hasCritical;
  const badge = critical ? `<span class="pill critical">BLOCKED</span>` : an.allRequiredVerified ? `<span class="pill blue">READY</span>` : `<span class="pill neutral">IN PROGRESS</span>`;
  return `<button class="deal-card ${critical?"state-critical":""}" data-action="open-deal" data-type="account" data-id="${a.id}">
    <div class="biz">${esc(a.business)}</div>
    <div class="contact">${esc(a.contact)} · CYCLE ${a.cycleNumber}</div>
    <div class="foot"><span class="value mono">${money(a.value)}</span>${badge}</div>
    <div class="days">${daysInStage(a)}D IN STAGE</div>
  </button>`;
}

/* ---------------------------------------------------------- */
/* OPPORTUNITY DETAIL                                            */
/* ---------------------------------------------------------- */
function openDeal(id){ openRecordDialog(id, "opportunity"); }
function openClient(id){ openRecordDialog(id, "client"); }
function openAccount(id){ openRecordDialog(id, "account"); }
function openRecordDialog(id, type){
  const dlg = document.getElementById("dealDialog");
  dlg.dataset.recordType = type;
  renderRecordDetail(id, type);
  if(!dlg.open) dlg.showModal();
}
function renderDeal(id){ renderRecordDetail(id, "opportunity"); }
function renderRecordDetail(id, type){
  const o = getRecord(id, type);
  if(!o) return;
  const a = analyzeStage(o);
  const stagesArr = stagesArrFor(o.stageId);
  const order = stagesArr.map(s=>s.id);
  const stepIdx = order.indexOf(o.stageId);
  const isOpp = type==="opportunity";

  let stepper = stagesArr.map((st,i)=>{
    let cls = "";
    if(isOpp && o.status==="lost") cls = i<=stepIdx ? "lost" : "";
    else if(i<stepIdx) cls = "done";
    else if(i===stepIdx) cls = "current";
    return `<div class="step ${cls}"><div class="dot">${i<stepIdx?"✓":i+1}</div><div class="lbl">${esc(st.name)}</div></div>`;
  }).join("");

  let gateBanner = "";
  if(isOpp && o.status==="lost"){
    gateBanner = `<div class="gate-banner blocked"><span class="g-icon mono">LOST</span><span>${esc(o.lostReason||"Marked lost.")}</span></div>`;
  } else if(isOpp && o.status==="handed_off"){
    gateBanner = `<div class="handed-badge">✓ HANDED TO FLOW — IN DELIVERY</div>`;
  } else if(type==="client" && o.status==="live"){
    gateBanner = `<div class="handed-badge">✓ LIVE — ONBOARDING COMPLETE</div>`;
  } else if(a.hasCritical){
    gateBanner = `<div class="gate-banner blocked"><span class="g-icon mono">GATE BLOCKED</span><span>This stage can't advance until every critical item is resolved.</span></div>`;
  } else if(a.allRequiredVerified){
    gateBanner = `<div class="gate-banner ready"><span class="g-icon mono">GATE CLEAR</span><span>Every required item is verified. Ready to move.</span></div>`;
  }

  const reqListHtml = a.items.map(({cfg,state})=>reqItemHtml(o,cfg,state,type)).join("");

  let handoffHtml = "";
  if(isOpp && o.stageId==="handoff" && o.status==="active"){
    handoffHtml = `<div class="handoff-box">
      <span class="kicker orange">HUNTER → FLOW</span><h4>HANDOFF PACKAGE</h4>
      <p>Flow can't start delivery until this checklist is complete. Tap an item to mark it done.</p>
      <div class="check-list">
        ${a.items.map(({cfg,state})=>`
          <div class="check-item ${state.status==="verified"?"checked":""}" data-action="toggle-handoff" data-id="${o.id}" data-req="${cfg.id}" style="cursor:pointer">
            <span class="box">${state.status==="verified"?"✓":""}</span>
            <span class="txt">${esc(cfg.label)}${cfg.required?"":" (optional)"}</span>
          </div>`).join("")}
      </div>
      <button class="btn primary full" data-action="send-handoff" data-id="${o.id}" ${a.allRequiredVerified?"":"disabled"}>SEND TO FLOW →</button>
    </div>`;
  }

  let decisionHtml = "";
  if(o.status==="active" && !(isOpp && o.stageId==="handoff")){
    const next = nextStageId(o.stageId);
    if(type==="client" && !next){
      decisionHtml = `<div class="decision-row">
        <button class="btn primary" data-action="mark-live" data-type="client" data-id="${o.id}" ${a.allRequiredVerified?"":"disabled"}>MARK LIVE →</button>
      </div>`;
    } else if(type==="account" && !next){
      decisionHtml = `<div class="decision-row">
        <button class="btn primary" data-action="complete-cycle" data-type="account" data-id="${o.id}" ${a.allRequiredVerified?"":"disabled"}>COMPLETE CYCLE → START CYCLE ${(o.cycleNumber||1)+1} →</button>
      </div>`;
    } else if(next){
      const isFinalGate = isOpp && o.stageId==="contract";
      decisionHtml = `<div class="decision-row">
        <button class="btn primary" data-action="advance" data-type="${type}" data-id="${o.id}" ${a.allRequiredVerified?"":"disabled"}>${isFinalGate?"ADVANCE → HANDOFF TO FLOW":"ADVANCE → "+stageName(next).toUpperCase()} →</button>
        ${isOpp ? `<button class="btn danger" data-action="mark-lost" data-id="${o.id}">MARK LOST</button>` : ""}
      </div>`;
    }
  }

  const timelineHtml = o.activity.slice(0,12).map((ev,i)=>`
    <div class="tl-item">
      <div class="tl-dot-col"><div class="tl-dot"></div>${i<Math.min(o.activity.length,12)-1?'<div class="tl-line"></div>':''}</div>
      <div class="tl-body">
        <div class="tl-top"><span class="tl-action">${esc(ev.action)}</span><span class="tl-time">${fmtDate(ev.ts)} · ${relTime(ev.ts)}</span></div>
        ${ev.detail?`<div class="tl-detail">${esc(ev.detail)}</div>`:""}
        <div class="tl-actor">${esc(ev.actor).toUpperCase()}</div>
      </div>
    </div>`).join("");

  const kicker = isOpp ? "HUNTER · OPPORTUNITY" : type==="account" ? "GROW · CLIENT ACCOUNT" : "FLOW · CLIENT";
  const subFields = isOpp
    ? `<span>CONTACT <b>${esc(o.contact)}</b></span><span>VALUE <b>${money(o.value)}</b></span><span>SOURCE <b>${esc(o.source)}</b></span><span>IN STAGE <b>${daysInStage(o)}D</b></span>`
    : type==="account"
      ? `<span>CONTACT <b>${esc(o.contact)}</b></span><span>VALUE <b>${money(o.value)}</b></span><span>CYCLE <b>${o.cycleNumber}</b></span><span>IN STAGE <b>${daysInStage(o)}D</b></span>`
      : `<span>CONTACT <b>${esc(o.contact)}</b></span><span>VALUE <b>${money(o.value)}</b></span><span>IN STAGE <b>${daysInStage(o)}D</b></span>`;

  document.getElementById("dealPanel").innerHTML = `
    <div class="modalHead">
      <div>
        <div class="deal-head"><div class="deal-head-left"><span class="kicker orange">${kicker}</span><h3>${esc(o.business)}</h3></div></div>
        <div class="deal-sub">${subFields}</div>
      </div>
      <button type="button" class="x" data-close-dialog="dealDialog">×</button>
    </div>
    <div class="modal-body">
      <div class="stepper">${stepper}</div>
      ${gateBanner}
      ${o.status==="active" ? `<div class="req-list">${reqListHtml}</div>` : ""}
      ${decisionHtml}
      ${handoffHtml}
      <div class="sectionTitle" style="margin-top:30px;"><div><span class="kicker blue">AUDIT TRAIL</span><h3 style="font-size:20px;">ACTIVITY HISTORY</h3></div></div>
      <div class="timeline">${timelineHtml}</div>
    </div>`;
}
function reqItemHtml(o,cfg,state,type){
  const t = type||"opportunity";
  const stateCls = state.status==="blocked" ? "state-blocked" : state.status==="submitted" ? "state-submitted" : state.status==="verified" ? "state-verified" : "";
  let body = "";
  if(state.status==="pending"){
    body = `<textarea class="ev-input" placeholder="Log what happened — call notes, doc link, number…" data-role="evidence-input"></textarea>
      <div class="req-actions"><button class="btn small primary" data-action="submit-evidence" data-type="${t}" data-id="${o.id}" data-req="${cfg.id}">SUBMIT EVIDENCE →</button></div>`;
  } else if(state.status==="submitted"){
    body = `<div class="req-evidence">${esc(state.evidence||"")}</div>
      <div class="req-actions">
        <button class="btn small ghost-blue" data-action="verify-req" data-type="${t}" data-id="${o.id}" data-req="${cfg.id}">✓ VERIFY</button>
        <button class="btn small danger" data-action="show-flag" data-id="${o.id}" data-req="${cfg.id}">⚑ FLAG ISSUE</button>
      </div>
      <div class="flag-row" style="display:none" data-role="flag-row">
        <input placeholder="What's wrong with this evidence?" data-role="flag-input">
        <button class="btn small danger" data-action="flag-req" data-type="${t}" data-id="${o.id}" data-req="${cfg.id}">CONFIRM</button>
      </div>`;
  } else if(state.status==="verified"){
    body = `<div class="req-evidence">${esc(state.evidence||"")}</div>
      <div class="req-meta">✓ VERIFIED BY ${esc((state.verifiedBy||"").toUpperCase())} · ${relTime(state.verifiedAt)}</div>
      <button class="reopen-link" data-action="reopen-req" data-type="${t}" data-id="${o.id}" data-req="${cfg.id}">reopen</button>`;
  } else if(state.status==="blocked"){
    body = `<div class="req-evidence" style="border-left-color:var(--critical); color:var(--paper)">⚑ ${esc(state.blockedReason||"")}</div>
      <div class="req-actions"><button class="btn small ghost-blue" data-action="resolve-req" data-type="${t}" data-id="${o.id}" data-req="${cfg.id}">MARK RESOLVED — BACK TO REVIEW</button></div>`;
  }
  return `<div class="req-item ${stateCls}">
    <div class="req-top"><div class="req-title">${esc(cfg.label)} ${cfg.required?"":'<span class="dim-tag">OPTIONAL</span>'}</div><div class="req-dims">${dimTags(cfg.dims)}</div></div>
    ${body}
  </div>`;
}

/* ---------------------------------------------------------- */
/* QUALITY CONSOLE                                               */
/* ---------------------------------------------------------- */
function renderQuality(){
  const filters = document.getElementById("qFilters");
  const dims = [["all","ALL"],["process","PROCESS"],["quality","QUALITY"],["growth","GROWTH"]];
  filters.innerHTML = dims.map(([id,l])=>`<button class="chip-filter ${STATE.ui.qDim===id?"active":""}" data-action="qfilter" data-dim="${id}">${l}</button>`).join("");
  let rows = [];
  activeRecords().forEach(({o,type})=>{
    stageReqs(o.stageId).forEach(cfg=>{
      const st = o.reqStatus[cfg.id];
      if(!st || st.status!=="submitted") return;
      if(STATE.ui.qDim!=="all" && !cfg.dims.includes(STATE.ui.qDim)) return;
      rows.push({o,cfg,st,type});
    });
  });
  document.getElementById("qualityView").innerHTML = rows.length ? rows.map(({o,cfg,st,type})=>`
    <div class="q-row">
      <div class="q-main">
        <div class="att-top"><span class="att-biz">${esc(o.business)}</span>${dimTags(cfg.dims)}<span class="pill neutral">${stageName(o.stageId)}</span><span class="pill neutral">${type==="client"?"ONBOARDING":type==="account"?"CLIENTS":"SALES"}</span></div>
        <div class="q-req">${esc(cfg.label)}</div>
        <div class="req-evidence" style="margin-top:8px; max-width:60ch;">${esc(st.evidence||"")}</div>
      </div>
      <div class="q-actions">
        <button class="btn small ghost-blue" data-action="verify-req" data-type="${type}" data-id="${o.id}" data-req="${cfg.id}">✓ VERIFY</button>
        <button class="btn small" data-action="open-deal" data-type="${type}" data-id="${o.id}">REVIEW IN DETAIL →</button>
      </div>
    </div>`).join("") : `<div class="empty-state">QUEUE'S CLEAR. NOTHING WAITING ON VERIFICATION.</div>`;
}

/* ---------------------------------------------------------- */
/* ADMIN — SOP GATES                                             */
/* ---------------------------------------------------------- */
function renderAdmin(){
  const el = document.getElementById("adminStages");
  const block = (st)=>{
    const reqs = stageReqs(st.id);
    return `<div class="admin-stage-block">
      <div class="admin-stage-head"><h4>${esc(st.name)}</h4><span class="kicker">${reqs.length} REQUIREMENT${reqs.length===1?"":"S"}</span></div>
      ${reqs.map(r=>adminReqRow(st.id,r)).join("")}
      <div class="admin-add-row"><button class="btn small" data-action="add-req" data-stage="${st.id}">+ ADD REQUIREMENT</button></div>
    </div>`;
  };
  el.innerHTML = `
    <div class="sectionTitle"><div><span class="kicker orange">SALES</span><h3 style="font-size:20px;">HUNTER WORKFLOW</h3></div></div>
    ${STAGES.map(block).join("")}
    <div class="sectionTitle" style="margin-top:30px;"><div><span class="kicker blue">ONBOARDING</span><h3 style="font-size:20px;">FLOW WORKFLOW</h3></div></div>
    ${ONB_STAGES.map(block).join("")}
    <div class="sectionTitle" style="margin-top:30px;"><div><span class="kicker amber">CLIENTS</span><h3 style="font-size:20px;">GROW WORKFLOW</h3></div></div>
    ${ACC_STAGES.map(block).join("")}
  `;
}
function adminReqRow(stageId, r){
  return `<div class="admin-req-row" data-stage="${stageId}" data-req="${r.id}">
    <div class="admin-req-name">${esc(r.label)}<span class="sub">${esc(r.dept)} · gate at ${r.thresholdDays}d</span></div>
    <div class="dim-toggle-group">
      ${["process","quality","growth"].map(d=>`<button class="dim-toggle ${r.dims.includes(d)?"on "+d:""}" data-action="toggle-dim" data-req="${r.id}" data-dim="${d}">${DIM_LABEL[d].slice(0,4)}</button>`).join("")}
    </div>
    <label class="switch" title="Required to advance">
      <input type="checkbox" ${r.required?"checked":""} data-action="toggle-required" data-req="${r.id}">
      <span class="track"><span class="thumb"></span></span>
    </label>
    <button class="del" data-action="del-req" data-req="${r.id}" title="Remove requirement">×</button>
  </div>`;
}

/* ---------------------------------------------------------- */
/* ADMIN — TEAM                                                  */
/* ---------------------------------------------------------- */
function renderTeam(){
  const rows = Object.entries(STATE.profiles).map(([id,p])=>({id, ...p}))
    .sort((a,b)=> (a.role==="admin"?-1:0) - (b.role==="admin"?-1:0) || a.fullName.localeCompare(b.fullName));
  document.getElementById("teamList").innerHTML = rows.map(p=>`
    <div class="team-row">
      <div><div class="team-name">${esc(p.fullName)} ${p.id===STATE.profile.id?'<span class="you-badge">YOU</span>':''}</div></div>
      <select class="team-role-select" data-action="team-role" data-id="${p.id}" ${p.id===STATE.profile.id?"disabled title='You can\\'t change your own seat'":""}>
        <option value="hunter" ${p.role==="hunter"?"selected":""}>HUNTER</option>
        <option value="flow" ${p.role==="flow"?"selected":""}>FLOW</option>
        <option value="admin" ${p.role==="admin"?"selected":""}>ADMIN</option>
      </select>
    </div>`).join("") || `<div class="empty-state">NO TEAMMATES YET.</div>`;
}

/* ---------------------------------------------------------- */
/* AUTH                                                          */
/* ---------------------------------------------------------- */
function showAuthError(msg){
  const el = document.getElementById("authError");
  el.textContent = msg; el.classList.add("show");
  document.getElementById("authNotice").classList.remove("show");
}
function showAuthNotice(msg){
  const el = document.getElementById("authNotice");
  el.textContent = msg; el.classList.add("show");
  document.getElementById("authError").classList.remove("show");
}
function clearAuthMsgs(){
  document.getElementById("authError").classList.remove("show");
  document.getElementById("authNotice").classList.remove("show");
}
function switchAuthTab(tab){
  document.querySelectorAll(".auth-tab").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
  document.getElementById("signinForm").classList.toggle("hidden", tab!=="signin");
  document.getElementById("signupForm").classList.toggle("hidden", tab!=="signup");
  document.getElementById("authHeadline").innerHTML = tab==="signin" ? "WHO'S <em>RUNNING</em><br>THE FLOOR?" : "JOIN THE<br><em>FLOOR</em>.";
  clearAuthMsgs();
}
function showLogin(){
  document.getElementById("loadingVeil").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
}
async function afterSignIn(session){
  STATE.session = session;
  let profile = null;
  for(let i=0;i<6;i++){
    const {data} = await sb.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    if(data){ profile = data; break; }
    await new Promise(r=>setTimeout(r,400));
  }
  if(!profile){ toast("Couldn't load your profile — try refreshing.", "orange"); showLogin(); return; }
  STATE.profile = {id:profile.id, fullName:profile.full_name, role:profile.role};
  document.getElementById("loadingVeil").classList.add("hidden");
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  updateUserChrome();
  await refreshAll();
  subscribeRealtime();
  showView(STATE.profile.role==="hunter" ? "sales" : "command");
}
function updateUserChrome(){
  document.getElementById("userInitial").textContent = STATE.profile.fullName.slice(0,1).toUpperCase();
  document.getElementById("userName").textContent = STATE.profile.fullName;
  document.getElementById("userRoleLabel").textContent = STATE.profile.role.toUpperCase();
}

/* ---------------------------------------------------------- */
/* REALTIME                                                      */
/* ---------------------------------------------------------- */
let refetchTimer = null;
let realtimeChannel = null;
function handleRealtimeChange(){
  clearTimeout(refetchTimer);
  refetchTimer = setTimeout(async ()=>{
    await refreshAll();
    if(STATE.ui.view!=="roadmap") showViewSilently(STATE.ui.view);
    const dlg = document.getElementById("dealDialog");
    if(dlg.open){ const id = dlg.dataset.dealId; const type = dlg.dataset.recordType||"opportunity"; if(id && getRecord(id,type)) renderRecordDetail(id,type); }
  }, 300);
}
function showViewSilently(viewId){
  if(viewId==="command") renderCommand();
  if(viewId==="sales") renderSales();
  if(viewId==="quality") renderQuality();
  if(viewId==="onboarding") renderOnboarding();
  if(viewId==="accounts") renderAccounts();
  if(viewId==="admin") renderAdmin();
  if(viewId==="team") renderTeam();
}
function subscribeRealtime(){
  realtimeChannel = sb.channel("engine-live")
    .on("postgres_changes", {event:"*", schema:"public", table:"opportunities"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"requirement_status"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"clients"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"client_requirement_status"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"accounts"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"account_requirement_status"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"activity_log"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"requirements"}, handleRealtimeChange)
    .on("postgres_changes", {event:"*", schema:"public", table:"profiles"}, handleRealtimeChange)
    .subscribe((status)=>{
      const badge = document.getElementById("connBadge");
      if(status==="SUBSCRIBED"){ badge.className="live"; badge.innerHTML = '<span class="live-dot"></span><span>LIVE</span>'; }
      else if(status==="CHANNEL_ERROR" || status==="TIMED_OUT" || status==="CLOSED"){ badge.className="offline"; badge.innerHTML = '<span>OFFLINE — RETRYING</span>'; }
    });
}

/* ---------------------------------------------------------- */
/* EVENT WIRING                                                   */
/* ---------------------------------------------------------- */
async function refreshAndRerender(){
  await refreshAll();
  showViewSilently(STATE.ui.view);
  const dlg = document.getElementById("dealDialog");
  if(dlg.open){ const id = dlg.dataset.dealId; if(id) renderRecordDetail(id, dlg.dataset.recordType||"opportunity"); }
}

function wireEvents(){
  document.querySelectorAll(".auth-tab").forEach(b=>b.addEventListener("click", ()=>switchAuthTab(b.dataset.tab)));

  document.getElementById("signinForm").addEventListener("submit", async (e)=>{
    e.preventDefault(); clearAuthMsgs();
    const fd = new FormData(e.target);
    const {data, error} = await sb.auth.signInWithPassword({email:fd.get("email"), password:fd.get("password")});
    if(error){ showAuthError(error.message); return; }
    afterSignIn(data.session);
  });

  document.getElementById("signupForm").addEventListener("submit", async (e)=>{
    e.preventDefault(); clearAuthMsgs();
    const fd = new FormData(e.target);
    const {data, error} = await sb.auth.signUp({
      email: fd.get("email"), password: fd.get("password"),
      options:{ data:{ full_name: fd.get("full_name") } }
    });
    if(error){ showAuthError(error.message); return; }
    if(data.session){ afterSignIn(data.session); }
    else { switchAuthTab("signin"); showAuthNotice("Check your email to confirm your account, then sign in."); }
  });

  document.getElementById("signOutBtn").addEventListener("click", async ()=>{
    if(realtimeChannel) sb.removeChannel(realtimeChannel);
    await sb.auth.signOut();
    location.reload();
  });

  document.getElementById("search").addEventListener("input", (e)=>{ STATE.ui.search = e.target.value; renderSales(); });

  document.getElementById("newForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    await createOpportunity({business:fd.get("business"), contact:fd.get("contact"), source:fd.get("source"), value:fd.get("value")});
    e.target.reset();
    document.getElementById("newDialog").close();
    if(STATE.ui.view!=="sales") showView("sales");
  });

  document.addEventListener("click",(e)=>{
    const closeBtn = e.target.closest("[data-close-dialog]");
    if(closeBtn){ document.getElementById(closeBtn.dataset.closeDialog).close(); }
  });
  document.getElementById("dealDialog").addEventListener("click",(e)=>{ if(e.target.id==="dealDialog") e.target.close(); });
  document.getElementById("newDialog").addEventListener("click",(e)=>{ if(e.target.id==="newDialog") e.target.close(); });

  document.addEventListener("click", async (e)=>{
    const t = e.target.closest("[data-action]");
    if(!t) return;
    const action = t.dataset.action;

    const recType = t.dataset.type || "opportunity";
    const RECORD_HANDLERS = {
      opportunity: {submitEvidence, verifyReq, flagReq, resolveReq, advance:advanceStage},
      client:      {submitEvidence:submitClientEvidence, verifyReq:verifyClientReq, flagReq:flagClientReq, resolveReq:resolveClientReq, advance:advanceClientStage},
      account:     {submitEvidence:submitAccountEvidence, verifyReq:verifyAccountReq, flagReq:flagAccountReq, resolveReq:resolveAccountReq, advance:advanceAccountStage}
    };
    const H = RECORD_HANDLERS[recType] || RECORD_HANDLERS.opportunity;

    if(action==="nav"){ showView(t.dataset.view); return; }
    if(action==="roadmap"){ renderRoadmap(t.dataset.label); return; }
    if(action==="open-new"){ document.getElementById("newDialog").showModal(); return; }
    if(action==="open-deal"){
      document.getElementById("dealDialog").dataset.dealId = t.dataset.id;
      openRecordDialog(t.dataset.id, recType);
      return;
    }

    if(action==="submit-evidence"){
      const input = t.closest(".req-item").querySelector('[data-role="evidence-input"]');
      const text = (input && input.value.trim()) || "Marked complete — no notes added.";
      await H.submitEvidence(t.dataset.id, t.dataset.req, text);
      return;
    }
    if(action==="verify-req"){ await H.verifyReq(t.dataset.id, t.dataset.req); return; }
    if(action==="show-flag"){ t.closest(".req-item").querySelector('[data-role="flag-row"]').style.display="flex"; return; }
    if(action==="flag-req"){
      const input = t.closest(".req-item").querySelector('[data-role="flag-input"]');
      await H.flagReq(t.dataset.id, t.dataset.req, input.value.trim());
      return;
    }
    if(action==="resolve-req" || action==="reopen-req"){ await H.resolveReq(t.dataset.id, t.dataset.req); return; }

    if(action==="advance"){ await H.advance(t.dataset.id); return; }
    if(action==="mark-live"){ await markClientLive(t.dataset.id); return; }
    if(action==="complete-cycle"){ await completeAccountCycle(t.dataset.id); return; }
    if(action==="mark-lost"){ await markLost(t.dataset.id, "Marked lost from Command Center."); return; }
    if(action==="toggle-handoff"){ await toggleHandoff(t.dataset.id, t.dataset.req); return; }
    if(action==="send-handoff"){ await sendHandoff(t.dataset.id); return; }

    if(action==="qfilter"){ STATE.ui.qDim = t.dataset.dim; renderQuality(); return; }

    if(action==="add-req"){ openAddReqInline(t); return; }
    if(action==="confirm-add-req"){
      const wrap = t.closest(".admin-add-row"); const input = wrap.querySelector("input");
      if(input.value.trim()) await addRequirement(t.dataset.stage, input.value.trim());
      else renderAdmin();
      return;
    }
    if(action==="del-req"){ await deleteRequirement(t.dataset.req); return; }
    if(action==="toggle-dim"){ await toggleDim(t.dataset.req, t.dataset.dim); return; }
  });

  document.addEventListener("change", async (e)=>{
    if(e.target.dataset && e.target.dataset.action==="toggle-required"){
      await toggleRequired(e.target.dataset.req, e.target.checked);
    }
    if(e.target.dataset && e.target.dataset.action==="team-role"){
      await updateTeamRole(e.target.dataset.id, e.target.value);
    }
  });
}
function openAddReqInline(btn){
  const wrap = btn.closest(".admin-add-row");
  if(wrap.querySelector("input")) return;
  wrap.innerHTML = `<div style="display:flex; gap:8px;">
    <input placeholder="New requirement label…" style="flex:1; background:var(--ink-3); border:1px solid var(--line); border-radius:2px; color:var(--paper); padding:8px 10px; font-size:13.5px;">
    <button class="btn small primary" data-action="confirm-add-req" data-stage="${btn.dataset.stage}">ADD</button>
  </div>`;
}

/* ---------------------------------------------------------- */
/* INIT                                                           */
/* ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async ()=>{
  wireEvents();
  const { data: { session } } = await sb.auth.getSession();
  if(session){ await afterSignIn(session); }
  else { showLogin(); }
});

})();
