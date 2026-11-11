import {workflowSteps} from "./app/workflow";
function App(){
  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="AnkiSubmarine home">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span><strong>AnkiSubmarine</strong><small>ANKI DECK ANALYZER &amp; ORGANIZER</small></span>
      </a>
      <div className="topbar-meta"><span className="local-badge"><span/>Local-first workspace</span><span className="version-label">FOUNDATION · v0.1.0</span></div>
    </header>
    <section className="hero">
      <div className="eyebrow"><span className="eyebrow-line"/>YOUR DECKS, UNDER CONTROL</div>
      <h1>Make room for<br/><em>better learning.</em></h1>
      <p className="hero-copy">Turn oversized Anki collections into clear, topic-based structures. Inspect what is actually inside, decide where every card belongs, and keep your original learning material intact.</p>
      <div className="hero-note"><span className="note-icon" aria-hidden="true">↳</span><span><strong>Built around your cards.</strong> AnkiSubmarine will propose a hierarchy from imported content—not from a preset template.</span></div>
    </section>
    <section className="workspace-panel" aria-labelledby="workflow-title">
      <div className="panel-heading"><div><div className="section-kicker">THE WORKFLOW</div><h2 id="workflow-title">From package to organized collection</h2></div><span className="phase-pill">PHASE 1 · FOUNDATION</span></div>
      <ol className="workflow-list">
        {workflowSteps.map((step,index)=><li className="workflow-step" key={step.id}>
          <span className="step-number">{String(index+1).padStart(2,"0")}</span><span className="step-label">{step.label}</span>
          {index<workflowSteps.length-1&&<span className="step-connector" aria-hidden="true"/>}
        </li>)}
      </ol>
      <div className="next-stage"><div className="stage-symbol" aria-hidden="true">↓</div><div className="stage-copy">
        <span className="section-kicker">NEXT MILESTONE</span><h3>Bring in your Anki package</h3>
        <p>The APKG inspection engine is scheduled for Phase 2. File selection is not enabled in this foundation build.</p>
      </div><span className="coming-soon">UP NEXT</span></div>
    </section>
    <section className="principles" aria-label="Product principles">
      <article><span className="principle-index">01 / PRESERVE</span><h3>Your source stays untouched.</h3><p>Organization changes will be made on a working copy. The imported package remains recoverable.</p></article>
      <article><span className="principle-index">02 / UNDERSTAND</span><h3>Classify from real content.</h3><p>Cards, notes, tags, and existing deck context will inform every proposed destination.</p></article>
      <article><span className="principle-index">03 / YOU DECIDE</span><h3>Review before export.</h3><p>Automated suggestions remain editable. Ambiguous cards go to a manual review queue.</p></article>
    </section>
    <footer className="footer"><span>ANKISUBMARINE <span className="footer-dot">·</span> INDEPENDENT PROJECT</span><span>LOCAL-FIRST BY DESIGN</span></footer>
  </main>;
}
export default App;