import {useRef,useState} from "react";
import {workflowSteps} from "./app/workflow";
import {inspectApkg} from "./core/apkg/import-client";
import type {ApkgInspectionSummary} from "./core/apkg/types";
function formatBytes(bytes:number){
  if(bytes<1024)return `${bytes} B`;
  const units=["KB","MB","GB"];let value=bytes/1024,index=0;
  while(value>=1024&&index<units.length-1){value/=1024;index++;}
  return `${value.toFixed(value>=100?0:1)} ${units[index]}`;
}
function App(){
  const inputRef=useRef<HTMLInputElement>(null);
  const [dragging,setDragging]=useState(false),[busy,setBusy]=useState(false);
  const [progress,setProgress]=useState({stage:"",percent:0}),[error,setError]=useState("");
  const [summary,setSummary]=useState<ApkgInspectionSummary|null>(null),[sourceFile,setSourceFile]=useState<File|null>(null);
  async function handleFile(file?:File){
    if(!file)return;
    setError("");setSummary(null);setSourceFile(file);setBusy(true);setProgress({stage:"Preparing package",percent:2});
    try{setSummary(await inspectApkg(file,(stage,percent)=>setProgress({stage,percent})));}
    catch(reason){setError(reason instanceof Error?reason.message:"Unable to inspect this APKG package.");}
    finally{setBusy(false);}
  }
  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="AnkiSubmarine home"><span className="brand-mark" aria-hidden="true">A</span><span><strong>AnkiSubmarine</strong><small>ANKI DECK ANALYZER &amp; ORGANIZER</small></span></a>
      <div className="topbar-meta"><span className="local-badge"><span/>Processed on this device</span><span className="version-label">PHASE 2 · APKG IMPORT</span></div>
    </header>
    <section className="hero"><div className="eyebrow"><span className="eyebrow-line"/>YOUR DECKS, UNDER CONTROL</div>
      <h1>Start with what’s<br/><em>inside your deck.</em></h1>
      <p className="hero-copy">Choose an Anki package to inspect its real collection database, existing deck definitions, cards, notes, note types, tags, and media inventory. Your file is processed locally in a background worker.</p>
      <div className="hero-note"><span className="note-icon" aria-hidden="true">↳</span><span><strong>Read-only inspection.</strong> The imported package is never modified. This milestone inventories the collection; content classification and reorganization come later.</span></div>
    </section>
    <section className="workspace-panel" aria-labelledby="workflow-title">
      <div className="panel-heading"><div><div className="section-kicker">THE WORKFLOW</div><h2 id="workflow-title">Import and inspect your collection</h2></div><span className="phase-pill">PHASE 2 · IMPORT ENGINE</span></div>
      <ol className="workflow-list">{workflowSteps.map((step,index)=><li className={index<2?"workflow-step active":"workflow-step"} key={step.id}><span className="step-number">{String(index+1).padStart(2,"0")}</span><span className="step-label">{step.label}</span>{index<workflowSteps.length-1&&<span className="step-connector" aria-hidden="true"/>}</li>)}</ol>
      <div className={dragging?"dropzone drag-active":"dropzone"} role="button" tabIndex={0} aria-label="Choose an Anki APKG file or drop one here"
        onClick={()=>!busy&&inputRef.current?.click()} onKeyDown={event=>{if((event.key==="Enter"||event.key===" ")&&!busy){event.preventDefault();inputRef.current?.click();}}}
        onDragOver={event=>{event.preventDefault();if(!busy)setDragging(true);}} onDragLeave={event=>{event.preventDefault();setDragging(false);}}
        onDrop={event=>{event.preventDefault();setDragging(false);if(!busy)void handleFile(event.dataTransfer.files[0]);}}>
        <input ref={inputRef} className="file-input" type="file" accept=".apkg,application/zip" disabled={busy} onChange={event=>{void handleFile(event.target.files?.[0]);event.target.value="";}}/>
        <div className="upload-symbol" aria-hidden="true">↑</div><div className="dropzone-title">{busy?"Inspecting your package…":"Drop your .apkg file here"}</div>
        <p>{busy?"Keep this tab open while the local inspection runs.":"or select a file from your device"}</p><span className="upload-action">{busy?"WORKING":"CHOOSE APKG FILE"}</span><span className="upload-limit">APKG · MAXIMUM 350 MB IN THIS BUILD</span>
      </div>
      {busy&&<div className="progress-panel" role="status" aria-live="polite"><div className="progress-copy"><span>{progress.stage}</span><strong>{progress.percent}%</strong></div><div className="progress-track"><span style={{width:`${progress.percent}%`}}/></div></div>}
      {error&&<div className="error-panel" role="alert"><strong>Import inspection failed</strong><p>{error}</p><button className="text-button" onClick={()=>inputRef.current?.click()}>Choose another file</button></div>}
      {summary&&<section className="inspection-results" aria-labelledby="results-title">
        <div className="results-heading"><div><div className="section-kicker">PACKAGE INSPECTION COMPLETE</div><h3 id="results-title">{summary.filename}</h3><p>{formatBytes(summary.fileSize)} · {summary.packageFormat==="latest"?"Modern Anki package":summary.packageFormat==="legacy-2"?"Legacy Anki 2.1 package":"Legacy Anki 2.0 package"}</p></div><span className={summary.integrity==="ok"?"integrity-ok":"integrity-warning"}>{summary.integrity==="ok"?"DATABASE CHECK OK":"CHECK WARNING"}</span></div>
        <div className="stats-grid"><div className="stat"><strong>{summary.deckCount.toLocaleString()}</strong><span>DECKS</span></div><div className="stat"><strong>{summary.noteCount.toLocaleString()}</strong><span>NOTES</span></div><div className="stat"><strong>{summary.cardCount.toLocaleString()}</strong><span>CARDS</span></div><div className="stat"><strong>{summary.noteTypeCount.toLocaleString()}</strong><span>NOTE TYPES</span></div><div className="stat"><strong>{summary.tagCount.toLocaleString()}</strong><span>TAGS</span></div><div className="stat"><strong>{summary.mediaCount.toLocaleString()}</strong><span>MEDIA FILES</span></div></div>
        <div className="results-columns"><div><h4>Detected deck definitions</h4>{summary.decks.length?<ul className="deck-list">{summary.decks.map((deck,index)=><li key={deck.id||`${deck.name}-${index}`}><span className="deck-dot"/>{deck.name}</li>)}</ul>:<p className="muted-copy">No deck names could be read from this schema.</p>}</div>
          <div><h4>Collection details</h4><dl className="detail-list"><div><dt>Database entry</dt><dd>{summary.collectionEntry}</dd></div><div><dt>Schema version</dt><dd>{summary.schemaVersion??"Not exposed"}</dd></div><div><dt>SQLite user version</dt><dd>{summary.sqliteUserVersion??"Not set"}</dd></div><div><dt>Archive entries</dt><dd>{summary.archiveEntryCount.toLocaleString()}</dd></div><div><dt>Media manifest</dt><dd>{summary.mediaManifestCount===null?"Unavailable":summary.mediaManifestCount.toLocaleString()}</dd></div><div><dt>Integrity</dt><dd>{summary.integrity}</dd></div></dl></div></div>
        {summary.warnings.length>0&&<div className="warning-list"><strong>Import warnings</strong><ul>{summary.warnings.map((warning,index)=><li key={index}>{warning}</li>)}</ul></div>}
        <div className="results-footer"><span>Original file retained in this session: <strong>{sourceFile?.name}</strong></span><span>Read-only · Local processing</span></div>
      </section>}
    </section>
    <section className="principles" aria-label="Import guarantees">
      <article><span className="principle-index">01 / PRIVATE</span><h3>Your package stays on-device.</h3><p>Archive extraction and SQLite inspection run locally in your browser. No deck content is uploaded.</p></article>
      <article><span className="principle-index">02 / CHECKED</span><h3>Inspect before interpreting.</h3><p>Archive paths, entry sizes, compression methods, collection format, and database integrity are checked.</p></article>
      <article><span className="principle-index">03 / UNCHANGED</span><h3>The source is read-only.</h3><p>This phase only inspects the uploaded package. No notes, cards, scheduling, or media are edited.</p></article>
    </section>
    <footer className="footer"><span>ANKISUBMARINE <span className="footer-dot">·</span> INDEPENDENT PROJECT</span><span>LOCAL-FIRST BY DESIGN</span></footer>
  </main>;
}
export default App;