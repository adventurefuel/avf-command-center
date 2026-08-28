<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Adventure Fuel Command Center</title>
<link rel="icon" href="data:,">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:ital,wght@0,400;0,500;0,600;0,700;1,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="styles.css">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
</head>
<body>

<!-- initial load veil -->
<div class="loading-veil" id="loadingVeil">
  <img src="assets/logo-sm.png" style="width:48px;opacity:.85;" alt="">
  <div class="spinner"></div>
  <div class="kicker">CONNECTING TO ADVENTURE FUEL OS…</div>
</div>

<!-- ============================================================
     AUTH GATE — real Supabase sign in / sign up
     ============================================================ -->
<div id="loginScreen" class="hidden">
  <div class="login-card">
    <img class="logo-hero" src="assets/logo-lg.png" alt="Adventure Fuel">
    <div class="login-eyebrow">Command Center — Internal Operating System</div>
    <h1 id="authHeadline">WHO'S <em>RUNNING</em><br>THE FLOOR?</h1>
    <p class="login-tagline">We don't sell marketing. We build customer&nbsp;acquisition systems.</p>

    <div class="auth-tabs">
      <button class="auth-tab active" data-tab="signin">SIGN IN</button>
      <button class="auth-tab" data-tab="signup">CREATE ACCOUNT</button>
    </div>

    <div class="auth-error" id="authError"></div>
    <div class="auth-notice" id="authNotice"></div>

    <form class="auth-form" id="signinForm">
      <label>EMAIL<input type="email" name="email" required autocomplete="email"></label>
      <label>PASSWORD<input type="password" name="password" required autocomplete="current-password"></label>
      <button class="btn primary full" type="submit">SIGN IN →</button>
    </form>

    <form class="auth-form hidden" id="signupForm">
      <label>YOUR NAME<input type="text" name="full_name" required autocomplete="name"></label>
      <label>EMAIL<input type="email" name="email" required autocomplete="email"></label>
      <label>PASSWORD (min. 6 characters)<input type="password" name="password" required minlength="6" autocomplete="new-password"></label>
      <button class="btn primary full" type="submit">CREATE ACCOUNT →</button>
    </form>

    <div class="login-foot">ADVENTURE FUEL OS &nbsp;·&nbsp; V1 COMMAND CENTER &nbsp;·&nbsp; LIVE ON SUPABASE</div>
  </div>
</div>

<!-- ============================================================
     APP SHELL
     ============================================================ -->
<div id="app" class="hidden">
  <aside>
    <div class="side-logo">
      <img src="assets/logo-sm.png" alt="">
      <div><b>ADVENTURE FUEL</b><small>OPERATING SYSTEM</small></div>
    </div>
    <nav id="nav"></nav>
    <div class="side-foot">
      <div id="connBadge" class="live"><span class="live-dot"></span><span>LIVE</span></div>
      <div class="user-row" style="margin-top:10px;">
        <div class="user-id">
          <div class="user-badge" id="userInitial">–</div>
          <div>
            <div class="user-name" id="userName">–</div>
            <div class="user-role" id="userRoleLabel">–</div>
          </div>
        </div>
        <button class="signout" id="signOutBtn" title="Sign out">⏻</button>
      </div>
    </div>
  </aside>

  <main>
    <header class="pagehead">
      <div><span class="kicker" id="pageKicker">ADVENTURE FUEL OS</span><h1 id="pageTitle">COMMAND CENTER</h1></div>
      <div class="pagehead-actions" id="pageActions"></div>
    </header>

    <!-- COMMAND CENTER -->
    <section id="view-command" class="view">
      <div class="hero">
        <div>
          <span class="kicker blue">TODAY'S SIGNAL</span>
          <h2>WHAT NEEDS<br>ATTENTION?</h2>
          <p>The system filters the noise. You handle the decisions. Everything verified and on track stays out of your way.</p>
        </div>
        <div class="gauge-wrap" id="heroGauge"></div>
      </div>
      <div id="metrics" class="metrics"></div>

      <div class="sectionTitle">
        <div><span class="kicker critical" id="critKicker">CRITICAL</span><h3>NEEDS YOUR ATTENTION</h3></div>
      </div>
      <div id="attention" class="attention"></div>

      <div class="sectionTitle">
        <div><span class="kicker blue">SYSTEM INTELLIGENCE</span><h3>AWAITING YOUR VERIFICATION</h3></div>
      </div>
      <div id="verifyQueue" class="attention"></div>

      <div class="sectionTitle">
        <div><span class="kicker orange">MOVING</span><h3>READY TO ADVANCE</h3></div>
      </div>
      <div id="readyList"></div>
    </section>

    <!-- SALES / HUNTER -->
    <section id="view-sales" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker orange">HUNTER — SALES WORKFLOW</span>
        <input id="search" class="search-input" placeholder="Search opportunities…">
      </div>
      <div id="pipeline" class="pipeline"></div>
    </section>

    <!-- ONBOARDING / FLOW -->
    <section id="view-onboarding" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker blue">FLOW — ONBOARDING WORKFLOW</span>
      </div>
      <div id="pipeline-onb" class="pipeline"></div>
    </section>

    <!-- CLIENTS / GROW -->
    <section id="view-accounts" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker amber">GROW — CLIENT WORKFLOW</span>
      </div>
      <div id="pipeline-acc" class="pipeline"></div>
    </section>

    <!-- CAMPAIGNS / LAUNCH -->
    <section id="view-campaigns" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker nitro">LAUNCH — CAMPAIGN WORKFLOW</span>
      </div>
      <div id="pipeline-cmp" class="pipeline"></div>
    </section>

    <!-- CONTENT / CRAFT -->
    <section id="view-content" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker violet">CRAFT — CONTENT WORKFLOW</span>
      </div>
      <div id="pipeline-cnt" class="pipeline"></div>
    </section>

    <!-- PROSPECTING / SCOUT -->
    <section id="view-prospecting" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker scout">SCOUT — PROSPECTING</span>
      </div>
      <div id="prospectMetrics" class="metrics"></div>
      <div id="prospectList"></div>
    </section>

    <!-- REPORTING / MEASURE -->
    <section id="view-reporting" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker cyan">MEASURE — CROSS-WORKFLOW REPORTING</span>
      </div>
      <div id="reportMetrics" class="metrics"></div>

      <div class="sectionTitle">
        <div><span class="kicker cyan">BY WORKFLOW</span><h3>PIPELINE BREAKDOWN</h3></div>
      </div>
      <div id="reportBreakdown"></div>

      <div class="sectionTitle">
        <div><span class="kicker cyan">EVIDENCE TRAIL</span><h3>RECENT ACTIVITY</h3></div>
      </div>
      <div id="reportFeed" class="report-feed"></div>
    </section>

    <!-- AUTOMATIONS / ATLAS -->
    <section id="view-automations" class="view">
      <div class="pipeline-toolbar">
        <span class="kicker spark">ATLAS — AUTOMATION ENGINE</span>
      </div>
      <p style="color:var(--paper-dim);font-size:14.5px;max-width:70ch;margin-bottom:26px;">
        Atlas is the layer underneath the workflow engine that acts on its own — no clicking required. Some of it is
        built into the cross-workflow wiring itself; some of it is a configurable rule you can switch on or off below.
        <b class="mono" style="color:var(--paper)">Note: these run whenever the app has data to refresh</b> — on load,
        on realtime updates, and after any action — not on a separate server schedule.
      </p>

      <div class="sectionTitle">
        <div><span class="kicker spark">CORE ENGINE</span><h3>SYSTEM AUTOMATIONS</h3></div>
      </div>
      <div id="systemAutomations"></div>

      <div class="sectionTitle">
        <div><span class="kicker spark">CONFIGURABLE</span><h3>RULES</h3></div>
      </div>
      <div id="ruleAutomations"></div>
    </section>

    <!-- QUALITY -->
    <section id="view-quality" class="view">
      <div class="q-filters" id="qFilters"></div>
      <div id="qualityView"></div>
    </section>

    <!-- ADMIN: SOP GATES -->
    <section id="view-admin" class="view">
      <p style="color:var(--paper-dim);font-size:14.5px;max-width:70ch;margin-bottom:26px;">
        This is the engine, not a Sales-only screen. Every requirement below is a configurable gate on the
        <b class="mono" style="color:var(--paper)">WORKFLOW → STAGE → REQUIREMENT</b> chain — change it here and every open
        opportunity inherits the new gate immediately, for everyone signed in. No developer required.
      </p>
      <div id="adminStages"></div>
    </section>

    <!-- ADMIN: TEAM -->
    <section id="view-team" class="view">
      <p style="color:var(--paper-dim);font-size:14.5px;max-width:70ch;margin-bottom:26px;">
        Everyone who's created an account. The first person to sign up became Admin automatically — promote or
        change anyone else's seat below.
      </p>
      <div id="teamList" style="background:var(--ink-2);border:1px solid var(--line);border-radius:var(--radius);"></div>
    </section>

    <!-- ADMIN: ARCHITECTURE / PUBLISH PIPELINE -->
    <section id="view-architecture" class="view">
      <div class="doc-wrap">
      <p style="color:var(--paper-dim);font-size:14.5px;max-width:70ch;margin-bottom:26px;">
        How a code change on Claude's side turns into what your team sees at the live URL — and where your data
        actually lives in between.
      </p>

      <div class="sectionTitle"><div><span class="kicker cyan">Systems</span><h3>The Diagram</h3></div></div>

      <div class="diagram-shell">
        <svg viewBox="0 0 1060 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="a-amber" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#FDB10E"/></marker>
            <marker id="a-fuel" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#FD4601"/></marker>
            <marker id="a-signal" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#14BDFF"/></marker>
            <marker id="a-cyan" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse"><path d="M0,0 L9,4 L0,8 Z" fill="#3ED9D0"/></marker>
            <marker id="a-nitro" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse"><path d="M0,0 L9,4 L0,8 Z" fill="#39D97A"/></marker>
          </defs>

          <line x1="125" y1="200" x2="430" y2="340" stroke="#3ED9D0" stroke-width="2" stroke-dasharray="1,6" stroke-linecap="round" marker-end="url(#a-cyan)" marker-start="url(#a-cyan)"/>
          <line x1="935" y1="200" x2="630" y2="340" stroke="#39D97A" stroke-width="2" stroke-dasharray="1,6" stroke-linecap="round" marker-end="url(#a-nitro)" marker-start="url(#a-nitro)"/>

          <rect class="diag-linklabel-bg" x="197" y="253" width="164" height="24" rx="3"/>
          <text class="diag-linklabel-text" x="279" y="269" fill="#3ED9D0">Schema + Live QA</text>

          <rect class="diag-linklabel-bg" x="700" y="253" width="192" height="24" rx="3"/>
          <text class="diag-linklabel-text" x="796" y="269" fill="#39D97A">Auth · Data · Realtime</text>

          <line x1="230" y1="120" x2="290" y2="120" stroke="#FDB10E" stroke-width="2.5" stroke-dasharray="7,5" marker-end="url(#a-amber)"/>
          <line x1="500" y1="120" x2="560" y2="120" stroke="#FD4601" stroke-width="2.5" marker-end="url(#a-fuel)"/>
          <line x1="770" y1="120" x2="830" y2="120" stroke="#14BDFF" stroke-width="2.5" marker-end="url(#a-signal)"/>

          <text class="diag-arrlabel" x="260" y="102">Upload</text>
          <text class="diag-arrlabel" x="530" y="102">Deploy</text>
          <text class="diag-arrlabel" x="800" y="102">Serve</text>

          <circle cx="260" cy="120" r="14" fill="#FDB10E"/><text class="diag-badge" x="260" y="121">1</text>
          <circle cx="530" cy="120" r="14" fill="#FD4601"/><text class="diag-badge" x="530" y="121">2</text>
          <circle cx="800" cy="120" r="14" fill="#14BDFF"/><text class="diag-badge" x="800" y="121">3</text>

          <foreignObject x="20" y="40" width="210" height="160">
            <div xmlns="http://www.w3.org/1999/xhtml" class="diag-node" style="--nodeline:#FFD23F">
              <div class="glyph">✦</div>
              <div class="name">Claude</div>
              <div class="role">Cowork session</div>
              <div class="desc">Writes app.js / index.html / styles.css. Applies schema changes straight to Supabase. Runs live QA in a real browser.</div>
            </div>
          </foreignObject>
          <foreignObject x="290" y="40" width="210" height="160">
            <div xmlns="http://www.w3.org/1999/xhtml" class="diag-node" style="--nodeline:#FDB10E">
              <div class="glyph">▦</div>
              <div class="name">GitHub</div>
              <div class="role">Source of truth</div>
              <div class="desc">Holds the three files that make up the whole site. The one manual step — Claude has no write access here this session.</div>
            </div>
          </foreignObject>
          <foreignObject x="560" y="40" width="210" height="160">
            <div xmlns="http://www.w3.org/1999/xhtml" class="diag-node" style="--nodeline:#FD4601">
              <div class="glyph">▲</div>
              <div class="name">Render</div>
              <div class="role">Static site host</div>
              <div class="desc">Builds nothing. Pulls the repo and serves the bundle as-is. No server, no backend code running here.</div>
            </div>
          </foreignObject>
          <foreignObject x="830" y="40" width="210" height="160">
            <div xmlns="http://www.w3.org/1999/xhtml" class="diag-node" style="--nodeline:#14BDFF">
              <div class="glyph">▣</div>
              <div class="name">Your Team</div>
              <div class="role">Any browser</div>
              <div class="desc">Hunter, Flow, Admin — everyone signed in. Every dynamic thing on the page happens straight from here.</div>
            </div>
          </foreignObject>
          <foreignObject x="360" y="340" width="340" height="140">
            <div xmlns="http://www.w3.org/1999/xhtml" class="diag-node" style="--nodeline:#3ED9D0">
              <div class="glyph">◈</div>
              <div class="name">Supabase</div>
              <div class="role">The only backend</div>
              <div class="desc">Postgres database, authentication, and realtime sync — every permission enforced by row-level security policy, not app code. Nothing else in this system holds state.</div>
            </div>
          </foreignObject>
        </svg>
      </div>

      <div class="diag-legend">
        <div class="row" style="--dot:#FDB10E"><div class="num">1</div><div><b style="color:var(--paper)">Upload.</b> Claude finishes a change and hands you the file(s). You paste them into the GitHub repo — this is the only step in the whole pipeline that has to be a human, since Claude isn't given push access in this session.</div></div>
        <div class="row" style="--dot:#FD4601"><div class="num">2</div><div><b style="color:var(--paper)">Deploy.</b> Once you confirm the upload, Claude calls Render's deploy API. Render pulls the latest commit from GitHub and rebuilds the static bundle — plain HTML, CSS, and JS, nothing compiled server-side.</div></div>
        <div class="row" style="--dot:#14BDFF"><div class="num">3</div><div><b style="color:var(--paper)">Serve.</b> Render hands that exact bundle to anyone who opens the live URL. Every teammate is running the identical file.</div></div>
        <div class="row runtime" style="--dot:#3ED9D0"><div class="num">↔</div><div><b style="color:var(--paper)">Claude ⇄ Supabase, any time.</b> Independent of a deploy — Claude connects straight to the database to run schema migrations and to query real data during QA.</div></div>
        <div class="row runtime" style="--dot:#39D97A"><div class="num">↔</div><div><b style="color:var(--paper)">Browser ⇄ Supabase, every session.</b> Sign-in, every read and write, and the realtime socket that pushes a teammate's change to everyone else's open tab — all bypass Render entirely and talk to Supabase directly.</div></div>
      </div>

      <div class="sectionTitle"><div><span class="kicker spark">Why</span><h3>Why It's Built This Way</h3></div></div>
      <div class="whycards">
        <div class="whycard" style="--accent:#FFD23F">
          <div class="k">No server, anywhere</div>
          <p>Render only hosts static files. That's why <b style="color:var(--paper)">Automations (Atlas)</b> runs client-side, triggered whenever someone's browser refreshes data — not on a schedule. There's no clock running when the app is closed.</p>
        </div>
        <div class="whycard" style="--accent:#FDB10E">
          <div class="k">The upload step is manual</div>
          <p>Claude can edit code and hand you a finished file, but can't push to your GitHub repo in this session — so every deploy needs you to move that one file across, once.</p>
        </div>
        <div class="whycard" style="--accent:#3ED9D0">
          <div class="k">RLS is the whole access model</div>
          <p>There's no custom backend to write permission checks in. Every table's <b style="color:var(--paper)">row-level security policy</b> in Postgres is the real, only gate on who can read or write what.</p>
        </div>
        <div class="whycard" style="--accent:#39D97A">
          <div class="k">Realtime keeps everyone in sync</div>
          <p>A gate one teammate verifies shows up on someone else's already-open tab within about a second — a live socket from the browser to Supabase, no page refresh involved.</p>
        </div>
      </div>

      <div class="sectionTitle"><div><span class="kicker">Reference</span></div></div>
      <div class="refgrid">
        <div class="refcard">
          <div class="rk" style="--rc:#FDB10E">▦ GitHub</div>
          <dl>
            <dt>Repository</dt><dd class="blank">— fill in your repo URL —</dd>
            <dt>Files tracked</dt><dd>app.js · index.html · styles.css</dd>
            <dt>Claude's access</dt><dd class="blank">read-only (no push, this session)</dd>
          </dl>
        </div>
        <div class="refcard">
          <div class="rk" style="--rc:#FD4601">▲ Render</div>
          <dl>
            <dt>Service</dt><dd>avf-command-center · static site</dd>
            <dt>Live URL</dt><dd>avf-command-center.onrender.com</dd>
            <dt>Service ID</dt><dd>srv-da8gca0n74is73dsl4q0</dd>
            <dt>Workspace ID</dt><dd>tea-da8for8n74is73dr01lg</dd>
          </dl>
        </div>
        <div class="refcard">
          <div class="rk" style="--rc:#3ED9D0">◈ Supabase</div>
          <dl>
            <dt>Project ref</dt><dd>cjixvpcoivfipmgmvomi</dd>
            <dt>Project URL</dt><dd>cjixvpcoivfipmgmvomi.supabase.co</dd>
            <dt>Holds</dt><dd>Postgres DB · Auth · Realtime · RLS</dd>
          </dl>
        </div>
        <div class="refcard">
          <div class="rk" style="--rc:#FFD23F">✦ Claude</div>
          <dl>
            <dt>Surface</dt><dd>Cowork session, claude.ai</dd>
            <dt>Connected via</dt><dd>Render MCP · Supabase MCP · Browser MCP</dd>
            <dt>Does</dt><dd>Build · migrate · deploy · QA</dd>
          </dl>
        </div>
      </div>
      </div>
    </section>

    <!-- REFERENCE: FIELD MANUAL -->
    <section id="view-manual" class="view">
      <div class="doc-wrap">
      <p style="color:var(--paper-dim);font-size:14.5px;max-width:70ch;margin-bottom:26px;">
        Every section of the Command Center, what it's for, and exactly how to run it. Written for whoever's
        signed in — Hunter, Flow, or Admin.
      </p>

      <div class="sectionTitle"><div><span class="kicker orange">Core</span><h3>Live V1</h3></div></div>

      <div class="doc-feat" style="--accent:#FD4601;--accent-soft:var(--fuel-soft)">
        <div class="doc-feat-head"><span class="kicker orange">⌁ Adventure Fuel OS</span></div>
        <h3>Command Center</h3>
        <p class="doc-purpose">Home base. One glance tells you whether the whole operation is stalled, running, or full send — and exactly which three things to touch today.</p>
        <h4>The fuel gauge</h4>
        <p style="color:var(--paper-dim);font-size:14.5px;margin:0 0 14px;">A single score, 0–100%: the share of required gates that are <b style="color:var(--paper)">verified</b> across every active record in every workflow, minus 5 points for every record currently carrying a critical (overdue or blocked) gate. <span class="pill critical" style="animation:none;">0–39 stalled</span> · <span class="pill orange">40–74 running</span> · <span class="pill blue">75–100 full send</span></p>
        <h4>The three panels</h4>
        <ol class="doc-steps">
          <li><b style="color:var(--paper)">Critical — needs your attention.</b> Every blocked or overdue required gate, worst-waiting first. Tap <span class="mono">Resolve →</span> to jump straight into that record.</li>
          <li><b style="color:var(--paper)">Awaiting Verification.</b> Evidence somebody already submitted, sitting on a required gate. Tap <span class="mono">Review →</span> to check it off or send it back.</li>
          <li><b style="color:var(--paper)">Ready to Advance.</b> Every required gate on the current stage is verified — free wins. Tap through to move it to the next stage.</li>
        </ol>
        <div class="doc-tip">Start every session here — it's a rollup of Sales, Onboarding, Clients, Campaigns, and Content, and the fastest way to find what actually needs a human today.</div>
      </div>

      <div class="doc-feat" style="--accent:#FD4601;--accent-soft:var(--fuel-soft)">
        <div class="doc-feat-head"><span class="kicker orange">↗ Hunter</span></div>
        <h3>Sales Workflow</h3>
        <p class="doc-purpose">Every lead from first call to signed contract. This is where a prospect becomes a client.</p>
        <div class="doc-stages">
          <span class="doc-stage-pill">Discovery Call</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Strategy Session</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Proposal Sent</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Contract Signed</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Handoff to Flow</span>
        </div>
        <h4>How to run it</h4>
        <ol class="doc-steps">
          <li><b style="color:var(--paper)">+ New Opportunity</b> to log a lead — business, contact, source, value.</li>
          <li>Open the card. Each stage has a fixed checklist of <b style="color:var(--paper)">gates</b> — tagged Process, Quality, and/or Growth, each with a days-to-complete threshold.</li>
          <li>Do the work, then <b style="color:var(--paper)">Submit Evidence</b> on that gate.</li>
          <li>Anyone (or an Admin) <b style="color:var(--paper)">Verifies</b> it, or <b style="color:var(--paper)">Flags</b> it back for fresh evidence.</li>
          <li>Every required gate verified → <b style="color:var(--paper)">Advance</b> moves it to the next stage automatically.</li>
          <li>On Handoff to Flow, once that checklist clears, <b style="color:var(--paper)">Send to Flow</b> hands the account to Onboarding by itself.</li>
        </ol>
        <div class="doc-tip">An opportunity can be <b style="color:var(--paper)">Marked Lost</b> at any point from its detail view — it leaves the active pipeline but stays in the audit trail.</div>
      </div>

      <div class="doc-feat" style="--accent:#FD4601;--accent-soft:var(--fuel-soft)">
        <div class="doc-feat-head"><span class="kicker orange">✓ Process · Quality · Growth</span></div>
        <h3>Verification Queue</h3>
        <p class="doc-purpose">One inbox for everything waiting on a check — pulled live from Sales, Onboarding, Clients, Campaigns, and Content at once.</p>
        <h4>How to run it</h4>
        <ol class="doc-steps">
          <li>Filter by dimension — All / Process / Quality / Growth — if you only own one lane.</li>
          <li>Read the submitted evidence right there in the row.</li>
          <li><b style="color:var(--paper)">✓ Verify</b> to clear it on the spot, or <b style="color:var(--paper)">Review in Detail →</b> to open the full record first.</li>
        </ol>
        <div class="doc-tip">Use this as your daily clear-the-queue screen instead of hunting through five separate boards.</div>
      </div>

      <div class="sectionTitle"><div><span class="kicker scout">Workflow Engine</span><h3>Live V2</h3></div></div>

      <div class="doc-feat" style="--accent:#6C8CFF;--accent-soft:var(--scout-soft)">
        <div class="doc-feat-head"><span class="kicker scout">🔍 Scout</span></div>
        <h3>Prospecting</h3>
        <p class="doc-purpose">Cold and warm leads that aren't a Sales opportunity yet — the pipeline that feeds Hunter.</p>
        <h4>How to run it</h4>
        <ol class="doc-steps">
          <li><b style="color:var(--paper)">+ New Prospect</b> builds a 4-touch cadence automatically: Call 1 today, Email 1 in 2 days, Call 2 in 5 days, Email 2 in 9 days.</li>
          <li>Make the call or send the email yourself, then <b style="color:var(--paper)">Mark Done</b> — a note is optional but recommended.</li>
          <li>Need one more nudge than the default cadence? <b style="color:var(--paper)">+ Add Touch</b> any time, any channel, any date.</li>
          <li>Landed the deal? Set a value and <b style="color:var(--paper)">Convert to Opportunity</b>. Going nowhere? <b style="color:var(--paper)">Mark Dead</b>.</li>
        </ol>
        <div class="doc-tip">Nothing here dials or emails for you. Scout tracks who's due for what and when — you still make the call.</div>
      </div>

      <div class="doc-feat" style="--accent:#14BDFF;--accent-soft:var(--signal-soft)">
        <div class="doc-feat-head"><span class="kicker blue">🛠 Flow</span></div>
        <h3>Onboarding Workflow</h3>
        <p class="doc-purpose">Turning a signed contract into a live, running account.</p>
        <div class="doc-stages">
          <span class="doc-stage-pill">Kickoff</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Access &amp; Assets</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Strategy &amp; Build</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Launch Prep</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Live</span>
        </div>
        <p style="color:var(--paper-dim);font-size:14.5px;">Same gate → evidence → verify → advance mechanics as Sales. Every gate on <b style="color:var(--paper)">Live</b> verified → <b style="color:var(--paper)">Mark Live</b> spins up the ongoing Client Account by itself.</p>
      </div>

      <div class="doc-feat" style="--accent:#FDB10E;--accent-soft:var(--amber-soft)">
        <div class="doc-feat-head"><span class="kicker amber">🤝 Grow</span></div>
        <h3>Client Workflow</h3>
        <p class="doc-purpose">The ongoing account, cycle after cycle. The only workflow here that doesn't end.</p>
        <div class="doc-stages">
          <span class="doc-stage-pill">Cycle Kickoff</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Optimization &amp; Review</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Reporting</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Client Delivery</span><span class="doc-stage-arrow">↻</span>
        </div>
        <p style="color:var(--paper-dim);font-size:14.5px;">Clear every gate on Client Delivery and the cycle resets straight back to Cycle Kickoff — this is a loop, not a finish line.</p>
      </div>

      <div class="doc-feat" style="--accent:#39D97A;--accent-soft:var(--nitro-soft)">
        <div class="doc-feat-head"><span class="kicker nitro">🚀 Launch</span></div>
        <h3>Campaign Workflow</h3>
        <p class="doc-purpose">Any paid or organic campaign running under a Client account.</p>
        <div class="doc-stages">
          <span class="doc-stage-pill">Strategy &amp; Targeting</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Creative Build</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Tracking &amp; QA</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Launch</span>
        </div>
        <p style="color:var(--paper-dim);font-size:14.5px;">Same gate mechanics; open a Client account to add a campaign under it.</p>
      </div>

      <div class="doc-feat" style="--accent:#B98CFF;--accent-soft:var(--violet-soft)">
        <div class="doc-feat-head"><span class="kicker violet">🖌 Craft</span></div>
        <h3>Content Workflow</h3>
        <p class="doc-purpose">Every deliverable, from first brief to published post.</p>
        <div class="doc-stages">
          <span class="doc-stage-pill">Brief &amp; Outline</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Draft</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Review &amp; Approval</span><span class="doc-stage-arrow">→</span>
          <span class="doc-stage-pill">Publish</span>
        </div>
        <p style="color:var(--paper-dim);font-size:14.5px;">Same gate mechanics; open a Client account to add a content item under it.</p>
      </div>

      <div class="doc-feat" style="--accent:#3ED9D0;--accent-soft:var(--cyan-soft)">
        <div class="doc-feat-head"><span class="kicker cyan">📊 Measure</span></div>
        <h3>Reporting</h3>
        <p class="doc-purpose">A read-only rollup across every workflow at once — for the weekly check-in, not the day-to-day grind.</p>
        <h4>What's on the page</h4>
        <ol class="doc-steps">
          <li><b style="color:var(--paper)">Top tiles:</b> active records, total pipeline value, overall SOP compliance, deals completed all-time / this month, critical gates open.</li>
          <li><b style="color:var(--paper)">By-workflow breakdown:</b> one card per workflow — active count, $ in flight, avg. days in stage, compliance %, completed count.</li>
          <li><b style="color:var(--paper)">Evidence Trail:</b> a live feed of every action, across every workflow, newest first — including anything Atlas does automatically.</li>
        </ol>
        <div class="doc-tip">Overall SOP Compliance is verified-required-gates ÷ judged-required-gates across everything active — it lines up exactly with a single workflow's own number whenever that's the only one with open activity.</div>
      </div>

      <div class="doc-feat" style="--accent:#FFD23F;--accent-soft:var(--spark-soft)">
        <div class="doc-feat-head"><span class="kicker spark">⚚ Atlas</span><span class="pill spark">Toggles: Admin only</span></div>
        <h3>Automations</h3>
        <p class="doc-purpose">The layer that acts without anyone clicking anything.</p>
        <h4>Core engine — always on</h4>
        <ol class="doc-steps">
          <li><b style="color:var(--paper)">Sales → Onboarding Handoff</b> — fires the moment an opportunity is sent to Flow. Can't be switched off.</li>
          <li><b style="color:var(--paper)">Onboarding → Clients Handoff</b> — fires the moment a client is marked live.</li>
        </ol>
        <h4>Configurable rules — Admin can flip these</h4>
        <ol class="doc-steps">
          <li><b style="color:var(--paper)">Stale Gate Escalation.</b> The first time a required gate goes overdue, logs an "Escalated:" entry to that record's audit trail.</li>
          <li><b style="color:var(--paper)">High-Value Opportunity Flag.</b> Auto-tags a brand-new opportunity the instant it's created if its value clears a threshold (default $5,000).</li>
        </ol>
        <div class="doc-tip">Read this before you assume something's broken: Atlas has no server and no clock. It runs only when the app has data to refresh — someone has it open, a teammate acts, or a realtime update lands. It is not a nightly job.</div>
      </div>

      <div class="doc-feat" style="--accent:#F3EEE0;--accent-soft:rgba(243,238,224,0.08)">
        <div class="doc-feat-head"><span class="kicker">◆ Market Intel</span></div>
        <h3>Competitive Analysis</h3>
        <p class="doc-purpose">A research panel on every single record — opportunities, clients, accounts, campaigns, and content alike.</p>
        <h4>How to run it</h4>
        <ol class="doc-steps">
          <li>Open any record, scroll to <b style="color:var(--paper)">Competitive Analysis</b>, and hit <b style="color:var(--paper)">+ Add Competitor</b>.</li>
          <li>Log their name, website, pricing notes, strengths, weaknesses, your differentiation angle, and where the research came from.</li>
          <li>Everyone signed in can see it the moment it's saved — tied to that one record, right alongside its gates and audit trail.</li>
        </ol>
      </div>

      <div class="sectionTitle"><div><span class="kicker">Admin</span></div></div>
      <div class="doc-feat" style="--accent:#F3EEE0;--accent-soft:rgba(243,238,224,0.08)">
        <div class="doc-feat-head"><span class="kicker">⚙ Admin — Workflow Engine</span><span class="pill neutral">Admin only</span></div>
        <h3>SOP Gates &amp; Team</h3>
        <p class="doc-purpose">Where the rulebook — and the roster — actually live.</p>
        <h4>SOP Gates</h4>
        <p style="color:var(--paper-dim);font-size:14.5px;margin:0 0 12px;">Every stage in every workflow, listed with its requirements. Toggle a gate <b style="color:var(--paper)">required</b> on or off, re-tag its Process / Quality / Growth dimensions, or <b style="color:var(--paper)">+ Add Requirement</b> to write a new one.</p>
        <div class="doc-tip">Changes apply live, instantly, to every open record for every teammate signed in. No redeploy, no waiting.</div>
        <h4>Team</h4>
        <table class="doc-roles">
          <thead><tr><th>Role</th><th>What it means</th></tr></thead>
          <tbody>
            <tr><td><span class="pill orange">Hunter</span></td><td>Default view is Sales. Works every workflow's gates like everyone else — can't touch SOP Gates or Automation toggles.</td></tr>
            <tr><td><span class="pill blue">Flow</span></td><td>Default view is Command Center. Same working access as Hunter, different default landing page.</td></tr>
            <tr><td><span class="pill neutral">Admin</span></td><td>Everything above, plus SOP Gates, Automation rule toggles/thresholds, Architecture reference, and changing anyone else's role.</td></tr>
          </tbody>
        </table>
        <p style="color:var(--paper-faint);font-size:13px;margin-top:12px;">The first person to ever sign up becomes Admin automatically. Everyone after that starts as Hunter until an Admin promotes them.</p>
      </div>
      </div>
    </section>

    <!-- ROADMAP (V2 / V3 locked views share this renderer) -->
    <section id="view-roadmap" class="view">
      <div class="roadmap-teaser" id="roadmapContent"></div>
    </section>

  </main>
</div>

<!-- ============================================================
     DIALOGS
     ============================================================ -->
<dialog id="dealDialog"><div id="dealPanel"></div></dialog>

<dialog id="newDialog">
  <div class="modalHead">
    <div><span class="kicker orange">HUNTER</span><h3>NEW OPPORTUNITY</h3></div>
    <button type="button" class="x" data-close-dialog="newDialog">×</button>
  </div>
  <form id="newForm" class="modal-body">
    <label>BUSINESS NAME<input name="business" required placeholder="e.g. Motor City Detailing"></label>
    <label>PRIMARY CONTACT<input name="contact" required placeholder="e.g. Dana Reyes"></label>
    <div class="two">
      <label>LEAD SOURCE
        <select name="source">
          <option>Referral</option><option>Outbound</option><option>Website</option><option>Networking</option><option>Social</option>
        </select>
      </label>
      <label>ESTIMATED VALUE ($)<input name="value" type="number" value="3000" min="0" step="100"></label>
    </div>
    <button class="btn primary full" type="submit">CREATE OPPORTUNITY →</button>
  </form>
</dialog>

<dialog id="newCampaignDialog">
  <div class="modalHead">
    <div><span class="kicker nitro">LAUNCH</span><h3>NEW CAMPAIGN</h3></div>
    <button type="button" class="x" data-close-dialog="newCampaignDialog">×</button>
  </div>
  <form id="newCampaignForm" class="modal-body">
    <label>CAMPAIGN NAME<input name="business" required placeholder="e.g. Q4 Retargeting — Motor City Detailing"></label>
    <label>PRIMARY CONTACT<input name="contact" required placeholder="e.g. Dana Reyes"></label>
    <div class="two">
      <label>LINKED CLIENT ACCOUNT
        <select name="account_id" id="campaignAccountSelect">
          <option value="">— none —</option>
        </select>
      </label>
      <label>BUDGET ($)<input name="value" type="number" value="1500" min="0" step="100"></label>
    </div>
    <button class="btn primary full" type="submit">CREATE CAMPAIGN →</button>
  </form>
</dialog>

<dialog id="newContentDialog">
  <div class="modalHead">
    <div><span class="kicker violet">CRAFT</span><h3>NEW CONTENT</h3></div>
    <button type="button" class="x" data-close-dialog="newContentDialog">×</button>
  </div>
  <form id="newContentForm" class="modal-body">
    <label>TITLE<input name="business" required placeholder="e.g. 5 Signs Your HVAC Needs a Tune-Up (blog)"></label>
    <label>OWNER<input name="contact" required placeholder="e.g. Dana Reyes"></label>
    <div class="two">
      <label>LINKED CLIENT ACCOUNT
        <select name="account_id" id="contentAccountSelect">
          <option value="">— none —</option>
        </select>
      </label>
      <label>EST. PRODUCTION COST ($)<input name="value" type="number" value="200" min="0" step="50"></label>
    </div>
    <button class="btn primary full" type="submit">CREATE CONTENT →</button>
  </form>
</dialog>

<dialog id="newProspectDialog">
  <div class="modalHead">
    <div><span class="kicker scout">SCOUT</span><h3>NEW PROSPECT</h3></div>
    <button type="button" class="x" data-close-dialog="newProspectDialog">×</button>
  </div>
  <form id="newProspectForm" class="modal-body">
    <label>BUSINESS NAME<input name="business" required placeholder="e.g. Royal Oak Family Dentistry"></label>
    <label>CONTACT<input name="contact" required placeholder="e.g. Dr. Sarah Kim"></label>
    <div class="two">
      <label>PHONE<input name="phone" type="tel" placeholder="(248) 555-0100"></label>
      <label>EMAIL<input name="email" type="email" placeholder="sarah@example.com"></label>
    </div>
    <div class="two">
      <label>WEBSITE<input name="website" type="url" placeholder="https://…"></label>
      <label>SOURCE
        <select name="source">
          <option>Cold list</option><option>Referral</option><option>Web research</option><option>Networking</option><option>Social</option>
        </select>
      </label>
    </div>
    <label>NOTES<textarea name="notes" placeholder="Why this prospect, what we know so far…"></textarea></label>
    <button class="btn primary full" type="submit">ADD PROSPECT — START CADENCE →</button>
  </form>
</dialog>

<dialog id="prospectDialog"><div id="prospectPanel"></div></dialog>

<dialog id="competitorDialog">
  <div class="modalHead">
    <div><span class="kicker" style="color:var(--paper-dim)">MARKET INTEL</span><h3>ADD COMPETITOR</h3></div>
    <button type="button" class="x" data-close-dialog="competitorDialog">×</button>
  </div>
  <form id="competitorForm" class="modal-body">
    <label>COMPETITOR NAME<input name="name" required placeholder="e.g. Anytime Fitness Clinton Twp"></label>
    <label>WEBSITE<input name="website" type="url" placeholder="https://…"></label>
    <label>PRICING NOTES<textarea name="pricingNotes" placeholder="e.g. $29.99/mo, no contract"></textarea></label>
    <div class="two">
      <label>STRENGTHS<textarea name="strengths" placeholder="What they do well"></textarea></label>
      <label>WEAKNESSES<textarea name="weaknesses" placeholder="Where they fall short"></textarea></label>
    </div>
    <label>OUR DIFFERENTIATION ANGLE<textarea name="angle" placeholder="How we position against them"></textarea></label>
    <label>SOURCE / NOTES<textarea name="sourceNotes" placeholder="Where this research came from"></textarea></label>
    <button class="btn primary full" type="submit">SAVE COMPETITOR →</button>
  </form>
</dialog>

<div id="toastHost"></div>

<script src="app.js"></script>
</body>
</html>
