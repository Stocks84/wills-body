'use strict';
const KEY='willsBody.v1', TABS=[['arms','Arms'],['chest-back','Chest & Back'],['shoulders','Shoulders'],['bodyweight','Bodyweight'],['equipment','Equipment']];
// Inline stroke icon set (24×24, currentColor, decorative – labels live on the buttons)
const IP={dumbbell:'<rect x="4" y="8" width="3" height="8" rx="1"/><rect x="17" y="8" width="3" height="8" rx="1"/><path d="M7 12h10M2 12h2M20 12h2"/>',
  barbell:'<path d="M2 12h20M5 8v8M8 5v14M16 5v14M19 8v8"/>',
  press:'<circle cx="12" cy="6" r="2"/><path d="M5 3l2.5 6h9L19 3M12 9v6M12 15l-3 6M12 15l3 6"/>',
  jump:'<circle cx="12" cy="4.5" r="2"/><path d="M4 8l8 3 8-3M12 11v4M12 15l-5 6M12 15l5 6"/>',
  bike:'<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l3.5-7H15l3 7M9.5 9L12 16H6M13 5h3l-1 4"/>',
  flame:'<path d="M12 3c.5 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.5-5 .2 1.4.9 2.4 2 3 .2-3-.4-5.4.5-8z"/>',
  pulse:'<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  contrast:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  pin:'<path d="M9 3h6M10 3v6l-3 4v1h10v-1l-3-4V3M12 14v7"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  leaf:'<path d="M5 20c0-9 5.5-15 15-15 0 9.5-6 15-15 15zM5 20l7-7"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v5M8 21h8M10 18h4"/>',
  swap:'<path d="M4 10a8 8 0 0 1 14-4l2 2M20 4v4h-4M20 14a8 8 0 0 1-14 4l-2-2M4 20v-4h4"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  alert:'<path d="M12 3l10 18H2L12 3zM12 10v5M12 18h.01"/>',
  undo:'<path d="M3 4v5h5"/><path d="M3.5 9a9 9 0 1 1 2.6 9.4"/>',
  play:'<path d="M7 4l13 8-13 8V4z"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  checkc:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  chevd:'<path d="M6 9l6 6 6-6"/>',chevu:'<path d="M6 15l6-6 6 6"/>',
  trend:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  note:'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5zM14 3v5h5M8 13h8M8 17h5"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  umbrella:'<path d="M3 12a9 9 0 0 1 18 0H3zM12 12v7a2 2 0 0 0 4 0"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  calx:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'};
const ic=(n,c='')=>`<svg class="ic${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${IP[n]}</svg>`;
const ICONS={arms:'dumbbell','chest-back':'barbell',shoulders:'press',bodyweight:'jump',equipment:'bike'};
const tabBtn=(k,l)=>`<span class="ti" aria-hidden="true">${ic(ICONS[k])}</span><span class="tl">${esc(l)}</span>`;
let draftNotes={};
// FEATURE · Fold finished exercises: once an exercise's target sets are logged today its card collapses to a one-line
// summary button (✓ name · n/n sets) to keep the page short. Tapping re-expands it; nothing is saved to storage.
// Fold state is UI-only and in-memory: cards fold once today's target sets are logged; tab/exId keys the user reopened
const unfolded=new Set(); let focusAfter=null;
const loggedToday=(T,id)=>T.sessions.filter(s=>s.date===today()).reduce((n,s)=>n+s.entries.filter(e=>e.exerciseId===id).reduce((m,e)=>m+e.sets.length,0),0);
let S, cur=localStorage.getItem(KEY+'.tab')||'arms', draft={}, ui={}; // draft: exId -> {sets:[], reps, weight, effort, targetSets}
const $=s=>document.querySelector(s), esc=Rules.esc; // esc() escapes & < > " ' – use it on EVERY interpolated value (names, numbers, dates, ids)
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(iso){
  const s=String(iso||''); if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const [y,m,d]=s.split('-').map(Number);
  return WD[new Date(Date.UTC(y,m-1,d)).getUTCDay()]+' '+d+' '+MO[m-1];
}
function fmtRange(a,b){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(a||''))||!/^\d{4}-\d{2}-\d{2}$/.test(String(b||''))) return (a||'')+' – '+(b||'');
  const [y1,m1,d1]=a.split('-').map(Number), [y2,m2,d2]=b.split('-').map(Number);
  if(y1===y2 && m1===m2) return d1+'\u2013'+d2+' '+MO[m1-1];
  if(y1===y2) return d1+' '+MO[m1-1]+'\u2013'+d2+' '+MO[m2-1];
  return d1+' '+MO[m1-1]+' '+y1+'\u2013'+d2+' '+MO[m2-1]+' '+y2;
}
function daysBetween(iso){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||''))) return 0;
  const [y,m,d]=iso.split('-').map(Number), t=today().split('-').map(Number);
  return Math.round((Date.UTC(t[0],t[1]-1,t[2])-Date.UTC(y,m-1,d))/864e5);
}
function agoPhrase(iso){const n=daysBetween(iso); return n<=0?'today':n===1?'1 day ago':n+' days ago'}
// FEATURE · Data safety (1.18.0): save() never throws (toast + false on quota/blocked storage); unreadable or
// unknown-version data is copied to a backup key BEFORE anything else happens and is never overwritten with seed data.
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(S));return true}
  catch(e){console.warn('save failed',e);toast('Could not save – storage full or blocked. Export a backup now.');return false}
}
let loadNotice=null; // shown as a card when stored data had to be set aside
function keepCopy(suffix,raw){localStorage.setItem(KEY+suffix,raw);} // throws if it can't – load() then shows the rescue card instead of seeding
function readStored(){
  const raw=localStorage.getItem(KEY); if(raw==null) return null;
  let d; try{d=JSON.parse(raw)}catch(e){d=undefined}
  if(!d||typeof d!=='object'||Array.isArray(d)){const k='.corrupt-'+Date.now();keepCopy(k,raw);loadNotice={kind:'corrupt',key:KEY+k};return null}
  if(d.version===2&&d.tabs&&typeof d.tabs==='object') return d; // current format: loaded unchanged
  const k='.pre-migrate-'+Date.now();keepCopy(k,raw);
  const m=Rules.migrateState(d); if(m){loadNotice={kind:'migrated',key:KEY+k};return m}
  loadNotice={kind:'corrupt',key:KEY+k};return null;
}
const seedCache={}; // each data/*.json is fetched at most once per load
function seed(k){return seedCache[k]||(seedCache[k]=fetch('data/'+k+'.json',{cache:'no-cache'}).then(r=>r.json()).catch(()=>null))}
const freshTab=d=>({_example:!!d._example,routine:d.routine||[],sessions:d.sessions||[],plans:[],dismissed:[],seedVersion:d.seedVersion||1,seedDates:(d.sessions||[]).map(s=>s.date)});
async function load(){
  S=readStored();
  if(!S){S={version:2,tabs:{},absences:[],restSec:75};
    for(const [k] of TABS) S.tabs[k]=freshTab((await seed(k))||{_example:true,routine:[],sessions:[]});
    save();}
  await upgrade();
}
// Post-load upgrades (also run after a backup restore): new tabs, seed versions, example tabs, one-off migrations
async function upgrade(){
  // Add tabs introduced after this phone's data was created (e.g. Equipment) without touching others
  for(const [k] of TABS){ if(S.tabs[k]) continue; S.tabs[k]=freshTab((await seed(k))||{routine:[],sessions:[]}); save(); }
  S.weeklyTarget=S.weeklyTarget||3; S.statsWindow=S.statsWindow||30; S.customLibrary=S.customLibrary||{}; S.absences=S.absences||[]; S.restSec=S.restSec||75;
  for(const [k] of TABS){const t=S.tabs[k];t.plans=t.plans||[];t.dismissed=t.dismissed||[];t.routine=t.routine||[];t.sessions=t.sessions||[];}
  // Seed-version migration: replace seeded sessions with newer seed, keep phone-logged sessions
  for(const [k] of TABS){const t=S.tabs[k];const d=await seed(k);
    if(d&&(d.seedVersion||1)>(t.seedVersion||1)&&!d._example){S.tabs[k]=Rules.mergeSeed(t,d);save();}}
  // Upgrade untouched example tabs to real seed data without wiping user logs
  for(const [k] of TABS){const t=S.tabs[k];if(!t._example||t.sessions.length)continue;const d=await seed(k);
    if(d&&!d._example){S.tabs[k]={...freshTab(d),_example:false,dismissed:t.dismissed||[]};save();}}
  // Combine Bodyweight rowing time+distance into one card (legacy session ids kept via legacyIds)
  for(const [k] of TABS){const t=S.tabs[k]; const m=Rules.migrateCombinedRowing(t);
    if(m!==t && JSON.stringify(m.routine)!==JSON.stringify(t.routine)){S.tabs[k]=m;save();}}
  // Equipment Rowing machine + Treadmill: Level+min → metres + minutes (remap historical sets once)
  for(const [k] of TABS){const t=S.tabs[k]; const m=Rules.migrateEquipmentMeters(t);
    if(m!==t){S.tabs[k]=m;save();}}
  if(!S.tabs[cur]) cur=TABS[0][0];
}
// FEATURE · In-progress workout survives an app reload/eviction: draft + notes saved under KEY.draft on every
// render/notes keystroke, restored on launch only if it's from today, removed on Finish and Discard.
const DRAFT_KEY=KEY+'.draft';
function saveDraft(){try{const hasNotes=Object.values(draftNotes).some(v=>v&&v.trim());
  if(Rules.draftSetCount(draft)||hasNotes) localStorage.setItem(DRAFT_KEY,JSON.stringify({day:today(),tab:cur,draft,notes:draftNotes}));
  else localStorage.removeItem(DRAFT_KEY);}catch(e){}}
const clearDraft=()=>{try{localStorage.removeItem(DRAFT_KEY)}catch(e){}};
function restoreDraft(){const r=Rules.draftFromStore(localStorage.getItem(DRAFT_KEY),today());
  if(!r){clearDraft();return 0} draft=r.draft;draftNotes=r.notes;return Rules.draftSetCount(draft);}
const U=Rules.unitInfo;
const fmtPlan=(p,u)=>esc(fmtPlanTxt(p,u)), fmtPlanTxt=(p,u)=>u==='kg'?`${p.sets}×${p.reps} @ ${p.weight}kg`:u==='level'?`${p.sets}× ${p.reps} min @ L${p.weight}`:u==='rowing'?`${p.sets}× ${p.reps} m · ${p.weight} min`:`${p.sets}×${p.reps}${U(u).short?' '+U(u).short:''}`;
function fmtSets(sets,u){return sets.map(x=>`<span class="chip">${esc(Rules.fmtSet(x,u))}${x.effort?' · '+esc(x.effort):''}</span>`).join('')}
function ensureDraft(ex, sessions){
  if(!draft[ex.id]){
    const plan=Rules.nextPlan(ex, sessions);
    draft[ex.id]={sets:[],reps:plan.reps,weight:plan.weight,effort:'Good',targetSets:plan.sets};
  }
  return draft[ex.id];
}
function colW(unit){return unit==='level'?'Lvl':unit==='rowing'?'min':'kg'}
function colR(unit){return unit==='rowing'?'m':(unit==='level'||unit==='min')?'min':'Reps'}
function prevOf(set, unit){if(!set) return '—'; return U(unit).hasWeight?set.weight+'\u00d7'+set.reps:String(set.reps)}
function foldState(ex, T){
  const d=ensureDraft(ex, T.sessions);
  const nToday=d.sets.length+loggedToday(T,ex.id), allDone=d.targetSets>0&&nToday>=d.targetSets, fk=cur+'/'+ex.id;
  if(!allDone) unfolded.delete(fk);
  return {d,nToday,allDone,fk};
}
function setTable(ex, d, last){
  const info=U(ex.unit), hasW=!!info.hasWeight;
  const n=Math.max(d.targetSets||1, d.sets.length+(d.sets.length>=(d.targetSets||1)?0:1));
  let h=`<div class="setgrid${hasW?'':' noweight'}"><div class="sethead"><span>Set</span><span>Previous</span>${hasW?`<span>${esc(colW(ex.unit))}</span>`:''}<span>${esc(colR(ex.unit))}</span><span></span></div>`;
  for(let i=0;i<n;i++){
    const prev=last&&last.sets?last.sets[i]:null, prevH=`<span class="prev">${esc(prevOf(prev, ex.unit))}</span>`;
    if(i<d.sets.length){
      const s=d.sets[i];
      h+=`<div class="setrow"><span class="sn">${i+1}</span>${prevH}${hasW?`<span class="cell">${esc(s.weight)}</span>`:''}<span class="cell">${esc(s.reps)}</span><span class="tick on">${ic('check')}</span></div>`;
    }else if(i===d.sets.length){
      h+=`<div class="setrow cur"><span class="sn">${i+1}</span>${prevH}`
        +(hasW?`<input class="step-in" type="number" inputmode="decimal" min="0" step="any" data-ex="${esc(ex.id)}" data-f="weight" value="${esc(d.weight)}" aria-label="${esc(info.weight||'Weight')}">`:'')
        +`<input class="step-in cur" type="number" inputmode="decimal" min="1" step="any" data-ex="${esc(ex.id)}" data-f="reps" value="${esc(d.reps)}" aria-label="${esc(info.reps)}">`
        +`<button type="button" class="tick" data-act="log" data-ex="${esc(ex.id)}" aria-label="Log set ${i+1}">${ic('check')}</button></div>`;
    }else{
      h+=`<div class="setrow"><span class="sn">${i+1}</span>${prevH}${hasW?`<span class="cell quiet">${esc(d.weight)}</span>`:''}<span class="cell"><i class="pend"></i></span><span class="tick" aria-hidden="true"></span></div>`;
    }
  }
  return h+'</div>';
}
function loggerInner(ex, T){
  const hist=Rules.history(ex.id,T.sessions), last=hist[hist.length-1], plan=Rules.nextPlan(ex,T.sessions);
  const d=ensureDraft(ex, T.sessions), flags=Rules.detectPlateaus(ex,T.sessions);
  const range=ex.repMin&&ex.repMin!==ex.repMax?esc(ex.repMin)+'\u2013'+esc(ex.repMax):esc(ex.targetReps);
  const rl=Rules.recentLast(ex,T.sessions,today());
  return `<h3>${esc(ex.name)}</h3>
    <div class="mut">Routine: ${esc(ex.targetSets)} × ${range} ${esc(U(ex.unit).reps.toLowerCase())}</div>
    <div class="nextline"><span class="mut">Next</span><span class="plan">${fmtPlan(plan,ex.unit)}</span><span class="suggnote">${esc(plan.note||'')}</span></div>
    ${flags.map(f=>`<div class="cue">${ic('alert')} ${esc(f.reason)}</div>`).join('')}
    ${rl?`<button type="button" class="ghost lastbtn" data-act="fill" data-ex="${esc(ex.id)}">${ic('undo')} Same as last time (${esc(fmtDate(rl.date))}): ${fmtPlan(rl,ex.unit)}</button>`:''}
    ${setTable(ex,d,last)}
    <div class="eff">${['Ok','Good','Tough'].map(e=>`<button type="button" class="${d.effort===e?'on':''}" aria-pressed="${d.effort===e}" data-act="eff" data-ex="${esc(ex.id)}" data-v="${e}">${e}</button>`).join('')}</div>
    <button type="button" class="primary" data-act="log" data-ex="${esc(ex.id)}">Log set ${Math.min(d.sets.length+1,99)} of ${esc(d.targetSets)}</button>
    <div class="sets">${fmtSets(d.sets,ex.unit)}${d.sets.length?`<button type="button" data-act="undo" data-ex="${esc(ex.id)}">${ic('undo')} Undo</button>`:''}</div>
    ${trendHTML(ex,T.sessions)}`;
}
function foldedBtn(ex, fold){
  return `<button type="button" class="card folded" data-act="unfold" data-ex="${esc(ex.id)}" aria-expanded="false" aria-label="${esc(ex.name)}: all ${esc(fold.d.targetSets)} sets logged today. Show details">${ic('checkc','ok')}<span class="fname">${esc(ex.name)}</span><span class="mut">${esc(fold.nToday)}/${esc(fold.d.targetSets)} sets</span>${ic('chevd')}</button>`;
}
function compactHTML(ex, T, selected){
  const fold=foldState(ex, T);
  if(fold.allDone&&!unfolded.has(fold.fk)) return foldedBtn(ex, fold);
  const hist=Rules.history(ex.id,T.sessions), last=hist[hist.length-1], plan=Rules.nextPlan(ex,T.sessions);
  const t=Rules.trendSeries(ex,T.sessions), flags=Rules.detectPlateaus(ex,T.sessions);
  const range=ex.repMin&&ex.repMin!==ex.repMax?esc(ex.repMin)+'\u2013'+esc(ex.repMax):esc(ex.targetReps);
  const cue=flags[0]?`<div class="cue">${ic('alert')} ${esc(flags[0].reason)}</div>`:(t.dates.length>=2?`<div class="trendline">${ic('trend')} Trend (${t.dates.length} sessions)</div>`:'');
  return `<div class="exwrap${selected?' has-deact':''}">
    <button type="button" class="card ex${selected?' sel':''}" data-act="openlog" data-ex="${esc(ex.id)}">
      <h3 class="title">${esc(ex.name)}</h3>
      <div class="mut">${esc(ex.targetSets)} × ${range} ${esc(U(ex.unit).reps.toLowerCase())} · Last ${last?esc(fmtDate(last.date)):'—'}</div>
      ${last?`<div class="sets">${fmtSets(last.sets,ex.unit)}</div>`:''}
      <div class="nextline"><span class="mut">Next</span><span class="plan">${fmtPlan(plan,ex.unit)}</span><span class="suggnote">${esc(plan.note||'')}</span></div>
      ${cue}
    </button>
    ${selected?`<button type="button" class="ghost iconbtn deact" data-act="toggle" data-ex="${esc(ex.id)}" aria-label="Deactivate ${esc(ex.name)}" title="Deactivate">${ic('x')}</button>`:''}
  </div>`;
}
function notesField(){
  const any=Object.values(draft).some(d=>d&&d.sets&&d.sets.length);
  return any?`<label class="mut" style="display:block;margin:8px 0">Workout notes (optional)<textarea id="sessNotes" rows="2">${esc(draftNotes[cur]||'')}</textarea></label>`:'';
}
function loggingHTML(T, openId){
  const acts=T.routine.filter(Rules.isActive), idx=Math.max(0, acts.findIndex(e=>e.id===openId)), ex=acts[idx];
  if(!ex) return '';
  const label=TABS.find(t=>t[0]===cur)[1], nDraft=Rules.draftSetCount(draft), fold=foldState(ex, T);
  let h=`<div class="loghead"><button type="button" class="iconbtn" data-act="closelog" aria-label="Close">${ic('x')}</button><div class="grow"><h2>${esc(label)}</h2><div class="mut">${nDraft?'In progress':'Logging'} · ${idx+1} of ${acts.length}</div></div><button type="button" class="primary slim" data-act="complete">${ic('check')} Finish</button></div>`;
  h+=fold.allDone&&!unfolded.has(fold.fk)?foldedBtn(ex, fold):`<div class="card">${loggerInner(ex,T)}</div>`;
  for(const o of acts){ if(o.id===ex.id) continue; const plan=Rules.nextPlan(o,T.sessions);
    h+=`<button type="button" class="upnext" data-act="openlog" data-ex="${esc(o.id)}"><span><span class="k">Up next</span><span class="nm">${esc(o.name)}</span></span><span class="plan">${fmtPlan(plan,o.unit)}</span></button>`; }
  return h+notesField();
}
function paneHTML(T, openId){
  const acts=T.routine.filter(Rules.isActive), ex=acts.find(e=>e.id===openId)||acts[0];
  if(!ex) return '<p class="mut">No active exercises.</p>';
  const label=TABS.find(t=>t[0]===cur)[1], nDraft=Rules.draftSetCount(draft), idx=acts.findIndex(e=>e.id===ex.id)+1;
  let h=`<div class="sesshead"><div class="sesshead-row"><h2>${esc(label)}</h2>${nDraft?`<button type="button" class="iconbtn" data-act="discard" aria-label="Discard workout" title="Discard workout">${ic('x')}</button><button type="button" class="primary slim" data-act="complete">Finish</button>`:''}</div><p class="meta">${nDraft?'In progress':'Ready'} · ${idx} of ${acts.length}</p></div>`;
  const fold=foldState(ex, T);
  h+=fold.allDone&&!unfolded.has(fold.fk)?foldedBtn(ex, fold):`<div class="card">${loggerInner(ex,T)}</div>`;
  return `<div class="pane-scroll">${h}${notesField()}</div>`;
}
function render(){
  const wide=matchMedia('(min-width:1024px)').matches;
  const T=S.tabs[cur], allDates=Object.values(S.tabs).flatMap(t=>t.sessions.map(s=>s.date));
  const lastS=T.sessions[T.sessions.length-1];
  const wl=$('#weekline'); if(wl) wl.textContent=lastS?`Last session ${fmtDate(lastS.date)} · ${agoPhrase(lastS.date)}`:'No sessions yet';
  $('#streak').innerHTML=`${Rules.activeSlots(T.routine)} active · ${T.sessions.length} sessions · ${ic('flame')} ${Rules.weeklyStreak(allDates,S.absences,today())} wk streak`;
  const st=Rules.workoutStats(S.tabs,S.absences,today(),S.statsWindow,S.weeklyTarget);
  const statTxt=st.done===0?`0 sessions in the last ${st.days} days`:`${st.done} ${st.done===1?'session':'sessions'} in the last ${st.days} days${st.pct==null?'':' · '+st.pct+'% complete'}`;
  $('#stats').innerHTML=ic('pulse')+' '+statTxt;
  $('#stats').title=`${st.done} workouts, ${st.planned} planned (${S.weeklyTarget} a week, absence weeks excluded). Tap to change the window.`;
  $('#tabs').innerHTML=TABS.map(([k,l])=>`<button type="button" role="tab" aria-selected="${k===cur}" data-tab="${k}">${tabBtn(k,l)}</button>`).join('');
  const acts=T.routine.filter(Rules.isActive);
  acts.forEach(ex=>ensureDraft(ex, T.sessions));
  let openId=null;
  if(ui.open && acts.some(e=>e.id===ui.open)) openId=ui.open;
  else if(wide) openId=(acts.find(e=>draft[e.id]&&draft[e.id].sets.length)||acts[0]||{}).id||null;
  else if(!ui.home){ const hit=acts.find(e=>draft[e.id]&&draft[e.id].sets.length); if(hit) openId=hit.id; }
  if(openId) ui.open=openId;
  const mobileLog=!wide && !!openId;
  document.body.classList.toggle('logging', mobileLog);
  parkTimer();
  let h='';
  if(mobileLog) h=loggingHTML(T, openId);
  else {
    if(loadNotice) h+=`<div class="card notice"><h3>${ic('alert')} ${loadNotice.kind==='corrupt'?"Saved data couldn't be read":'Data upgraded from an older format'}</h3><div class="help">${loadNotice.kind==='corrupt'?'Nothing was deleted: the unreadable copy was kept on this phone. Export it and send it over so it can be recovered.':'A copy of the original was kept on this phone before upgrading.'}</div><div class="row"><button type="button" class="ghost" data-act="rawexport">${ic('download')} Export raw copy</button><button type="button" class="ghost" data-act="noticeok">Dismiss</button></div></div>`;
    const week=Rules.weekStrip(S.tabs,TABS.map(t=>t[0]),today());
    if(week.some(c=>c.sessions>0)) h+=`<div class="strip" aria-label="This week">${week.map(c=>{const l=TABS.find(t=>t[0]===c.tab)[1]; const n=c.sessions|0;
      const detail=n?(c.volume?Math.round(c.volume)+' kg':c.minutes?c.minutes+' min':'done'):'\u2014';
      return `<button type="button" data-tab="${c.tab}" aria-label="${esc(l)}, ${n} ${n===1?'session':'sessions'} this week" class="cell lvl${Math.min(3,n)}${c.tab===cur?' cur':''}">${ic(ICONS[c.tab])}<b>${n}</b><small>${esc(detail)}</small></button>`;
    }).join('')}</div>`;
    h+=`<button type="button" class="ghost" data-act="copy" style="width:100%;margin:8px 0">${ic('copy')} Copy session</button>`;
    const nDraft=Rules.draftSetCount(draft);
    if(nDraft) h+=`<div class="inprog"><div><b>Workout in progress · ${nDraft} set${nDraft>1?'s':''}</b><div class="help">Finish saves your workout and sets next time's targets.</div></div><button type="button" class="ghost iconbtn inprog-x" data-act="discard" aria-label="Discard workout" title="Discard workout">${ic('x')}</button></div>`;
    else h+=`<button type="button" class="primary start" data-act="quick">${ic('play')} Start workout</button><div class="help">Pick a block, log your sets, then Finish.</div>`;
    const dl=deloadFor(cur);
    if(dl.due) h+=`<div class="card deload"><h3>${ic('leaf')} Deload week due</h3><div class="help">${esc(dl.weeks)} training weeks since ${esc(fmtDate(dl.anchor))}. Do one lighter session at −20% weight to recover; it won't count for records or stall checks.</div>
      <button type="button" class="primary" data-act="deload">Plan deload session</button><div class="row" style="margin-top:8px"><button type="button" class="ghost" data-act="dlsnooze">Snooze 1 week</button><button type="button" class="ghost" data-act="dlskip">Skip this cycle</button></div></div>`;
    if(lastRecords.length) h+=`<div class="card record"><h3>${ic('trophy')} New record${lastRecords.length>1?'s':''}</h3>${lastRecords.map(r=>`<div>${recTxt(r)}</div>`).join('')}<button type="button" class="ghost" data-act="recok" style="margin-top:8px;width:100%">Dismiss</button></div>`;
    const wk=Rules.isoWeek(today());
    if(new Date().getDay()===0 && S.reportDismissed!==wk) h+=reportCard(true);
    if(T._example) h+=`<div class="banner"><span>Example routine – import your log</span><button type="button" data-act="import">Import</button></div>`;
    for(const c of Rules.plateauCards(cur,T.routine,T.sessions,T.dismissed,S.customLibrary))
      h+=`<div class="card sugg"><h3>${ic('swap')} Time to change this exercise</h3><div class="mut">${esc(c.reason)}</div>${c.alternatives.map(x=>`<div class="row" style="margin-top:8px"><span>${esc(x.name)}${x.source==='library'?'':' <span class=mut>(alt)</span>'}</span><button type="button" data-act="swap" data-from="${esc(c.exerciseId)}" data-n="${esc(x.name)}">Swap in</button><button type="button" class="ghost" data-act="dismiss" data-n="${esc(x.name)}" aria-label="Dismiss">${ic('x')}</button></div>`).join('')}</div>`;
    const stalledIds=new Set(Rules.plateauCards(cur,T.routine,T.sessions,T.dismissed).map(c=>c.exerciseId));
    for(const s of Rules.suggestions(cur,T.routine,T.sessions,T.dismissed,S.customLibrary).filter(s=>!stalledIds.has(s.exerciseId)))
      h+=`<div class="card sugg"><h3>${ic('bulb')} Try ${esc(s.exercise)}</h3><div class="mut">${esc(s.reason)}</div><div class="row" style="margin-top:8px">
        <button type="button" data-act="up" data-n="${esc(s.exercise)}" data-from="${esc(s.exerciseId)}">${ic('plus')} Add</button><button type="button" data-act="dismiss" data-n="${esc(s.exercise)}">${ic('x')} Dismiss</button></div></div>`;
    const snap=T.plans[T.plans.length-1];
    if(snap) h+=`<div class="card"><h3>Saved plan for next session</h3><div class="mut">Snapshot from ${esc(fmtDate(snap.date))}</div>${snap.items.map(i=>`<div>${esc(i.name)}: <span class="plan">${fmtPlan(i,i.unit)}</span></div>`).join('')}</div>`;
    for(const ex of acts) h+=compactHTML(ex, T, wide&&ex.id===openId);
    const inactive=T.routine.filter(r=>!Rules.isActive(r));
    if(inactive.length) h+=`<details class="card"><summary>Inactive / optional (${inactive.length})</summary>${inactive.map(r=>`<div class="row" style="margin-top:8px"><span>${esc(r.name)}</span><button type="button" class="ghost" data-act="toggle" data-ex="${esc(r.id)}">Activate</button></div>`).join('')}</details>`;
    if(!wide) h+=notesField();
    h+=libraryCard(T);
    h+=`<div class="row" style="margin:16px 0"><button type="button" class="ghost" data-act="import">Import log</button></div>`;
    const hist=[...T.sessions].reverse();
    if(hist.length) h+=`<details class="card"><summary>Session history (${hist.length})</summary>${hist.map(s=>`<div class="hist"><b>${esc(fmtDate(s.date))}</b>${s.label?' · '+esc(s.label):''}<div class="mut">${s.entries.map(e=>{const r=T.routine.find(x=>x.id===e.exerciseId)||T.routine.find(x=>(x.legacyIds||[]).includes(e.exerciseId)); const nm=r?r.name:(e.exerciseId==='ex-row-time'||e.exerciseId==='ex-row-distance'?'Rowing':e.exerciseId); return esc(nm)+' '+e.sets.length+'×'+esc(e.sets[0]?e.sets[0].reps:'')+(e.sets[0]&&e.sets[0].weight?' @'+esc(e.sets[0].weight)+(r&&r.unit==='rowing'?' min':'kg'):'')}).join(' · ')}</div>${s.notes?`<div class="note">${ic('note')} ${esc(s.notes)}</div>`:''}</div>`).join('')}</details>`;
  }
  const main=$('#main'); main.innerHTML=h; main.removeAttribute('aria-busy');
  const pane=$('#pane');
  if(pane){ if(wide){pane.hidden=false;pane.innerHTML=paneHTML(T, openId);} else {pane.hidden=true;pane.innerHTML='';} }
  if(focusAfter){const f=document.querySelector(focusAfter);focusAfter=null;if(f)f.focus({preventScroll:true});}
  const sn=$('#sessNotes'); if(sn) sn.oninput=()=>{draftNotes[cur]=sn.value;saveDraft()};
  saveDraft();
  placeChrome();
}
function stepper(id,f,label,v){const mode=f==='weight'||f==='reps'?'decimal':'numeric';const min=f==='weight'?0:1;
  return `<div class="step"><button type="button" data-act="dec" data-ex="${esc(id)}" data-f="${f}" aria-label="less ${label}">−</button><div class="v"><input class="step-in" type="number" inputmode="${mode}" min="${min}" step="any" data-ex="${esc(id)}" data-f="${f}" value="${esc(v)}" aria-label="${label}"><small>${label}</small></div><button type="button" data-act="inc" data-ex="${esc(id)}" data-f="${f}" aria-label="more ${label}">+</button></div>`}
function clampField(f, raw){ const n=Number(raw); if(!Number.isFinite(n)) return f==='weight'?0:1;
  if(f==='weight') return Math.max(0, Math.round(n*10)/10); return Math.max(1, Math.round(n*10)/10); }
function libraryCard(T){
  const built=Rules.LIBRARY[cur]||[], custom=(S.customLibrary&&S.customLibrary[cur])||[];
  const units=cur==='equipment'?[['rowing','Distance m + Time min'],['level','Level + min'],['min','Minutes'],['m','Metres']]:cur==='bodyweight'?[['bodyweight','Reps'],['rowing','Rowing (m + min)'],['min','Minutes'],['m','Metres']]:[['kg','kg'],['bodyweight','Bodyweight'],['level','Level']];
  return `<details class="card libcard"><summary>${ic('plus')} Exercise library</summary>
    <div class="help">Add a custom exercise to this tab, or activate one from the built-in / saved library. No limit on how many are active.</div>
    <div class="lib-add">
      <label class="mut">Name<input type="text" id="libName" placeholder="e.g. Cable crunch" autocomplete="off"></label>
      <label class="mut">Unit<select id="libUnit">${units.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
      <div class="row"><label class="mut">Sets<input type="number" id="libSets" inputmode="numeric" min="1" value="3"></label>
        <label class="mut">Target<input type="number" id="libReps" inputmode="decimal" min="1" value="${cur==='bodyweight'?12:10}"></label></div>
      <button type="button" class="primary" data-act="libadd">${ic('plus')} Add to routine</button>
    </div>
    ${custom.length?`<div class="mut" style="margin-top:10px">Your library</div><div class="lib-list">${custom.map(n=>`<div class="row" style="margin-top:6px"><span>${esc(n)}</span>
      <button type="button" class="ghost" data-act="libuse" data-n="${esc(n)}">Add</button>
      <button type="button" class="ghost" data-act="librm" data-n="${esc(n)}" aria-label="Remove">${ic('x')}</button></div>`).join('')}</div>`:''}
    ${built.length?`<div class="mut" style="margin-top:10px">Suggested</div><div class="lib-list">${built.map(n=>`<div class="row" style="margin-top:6px"><span>${esc(n)}</span>
      <button type="button" class="ghost" data-act="libuse" data-n="${esc(n)}">Add</button></div>`).join('')}</div>`:''}
  </details>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b||!S) return; const T=S.tabs[cur];
  if(b.dataset.tab){cur=b.dataset.tab;localStorage.setItem(KEY+'.tab',cur);render();scrollTo(0,0);return}
  const a=b.dataset.act, d=draft[b.dataset.ex], ex=T.routine.find(r=>r.id===b.dataset.ex);
  if(a==='inc'||a==='dec'){const f=b.dataset.f, st=f==='weight'?U(ex.unit).wStep:1, sg=a==='inc'?1:-1;d[f]=Math.max(f==='weight'?0:1,Math.round((d[f]+sg*st)*10)/10);}
  else if(a==='eff') d.effort=b.dataset.v;
  else if(a==='fill'){const l=Rules.lastValues(ex,T.sessions);if(l){d.targetSets=l.sets;d.reps=l.reps;d.weight=l.weight;}}
  else if(a==='copy'){copySession();return}
  // Fold / unfold toggles UI state only and restores keyboard focus to the same card
  else if(a==='unfold'||a==='fold'){const k=cur+'/'+b.dataset.ex,q=CSS.escape(b.dataset.ex);a==='unfold'?unfolded.add(k):unfolded.delete(k);focusAfter=`[data-act=${a==='unfold'?'fold':'unfold'}][data-ex="${q}"]`;}
  else if(a==='openlog'){ui.open=b.dataset.ex;ui.home=false;}
  else if(a==='closelog'){if(Rules.draftSetCount(draft)){confirmDiscard();return}ui.open=null;ui.home=true;}
  else if(a==='log'){d.sets.push({reps:d.reps,weight:U(ex.unit).hasWeight?d.weight:0,effort:d.effort});startTimer();focusAfter=`[data-ex="${CSS.escape(ex.id)}"]:is([data-act=unfold],[data-act=log])`;}
  else if(a==='undo') d.sets.pop();
  else if(a==='up'){const n=b.dataset.n;T.routine=Rules.acceptSuggestion(T.routine,{exerciseId:b.dataset.from},{id:'ex-'+Rules.slug(n),name:n,targetSets:3,targetReps:cur==='bodyweight'?12:10,unit:cur==='bodyweight'?'bodyweight':cur==='equipment'?'level':'kg'});save();}
  else if(a==='swap'){T.routine=Rules.swapExercise(T.routine,b.dataset.from,{name:b.dataset.n});delete draft[b.dataset.from];save();toast('Swapped in '+b.dataset.n);}
  else if(a==='quick'){openQuick();return}
  else if(a==='recok'){lastRecords=[];}
  else if(a==='deload'){openQuick({deload:cur});return}
  else if(a==='dlsnooze'){S.deload=S.deload||{};S.deload[cur]={...(S.deload[cur]||{}),snoozeUntil:Rules.addDays(today(),7)};save();}
  else if(a==='dlskip'){S.deload=S.deload||{};S.deload[cur]={...(S.deload[cur]||{}),skippedOn:today()};save();}
  else if(a==='report'){openReport();return}
  else if(a==='repok'){S.reportDismissed=Rules.isoWeek(today());save();}
  else if(a==='toggle'){const r=T.routine.find(r=>r.id===b.dataset.ex);if(!r)return;
    if(r.active===false){r.active=true;save();}
    else{r.active=false;save();toastAction('Deactivated '+r.name,'Undo',()=>{r.active=true;save();render();});}}
  else if(a==='rawexport'){exportRaw();return}
  else if(a==='noticeok'){loadNotice=null;}
  else if(a==='undoimport'){undoImport();return}
  else if(a==='dismiss'){T.dismissed.push(b.dataset.n);save();}
  else if(a==='complete') complete();
  else if(a==='discard'){confirmDiscard();return}
  else if(a==='import') openImport();
  else if(a==='libadd'){const name=($('#libName')&&$('#libName').value||'').trim(); if(!name){toast('Enter an exercise name');return;}
    const unit=($('#libUnit')&&$('#libUnit').value)|| (cur==='bodyweight'?'bodyweight':cur==='equipment'?'level':'kg');
    const sets=clampField('sets', $('#libSets')&&$('#libSets').value||3), reps=clampField('reps', $('#libReps')&&$('#libReps').value||10);
    const ex=Rules.makeCustomExercise(name,{unit,targetSets:sets,targetReps:reps,noAutoProgress:unit==='rowing'||unit==='m'});
    if(unit==='rowing'){ex.targetWeight=20;ex.legacyIds=[];}
    T.routine=Rules.addExerciseToRoutine(T.routine,ex); S.customLibrary=Rules.addLibraryEntry(S.customLibrary,cur,name); save(); toast('Added '+name);}
  else if(a==='libuse'){const n=b.dataset.n; const unit=cur==='bodyweight'?'bodyweight':cur==='equipment'?'level':'kg';
    T.routine=Rules.addExerciseToRoutine(T.routine,Rules.makeCustomExercise(n,{unit})); save(); toast('Added '+n);}
  else if(a==='librm'){S.customLibrary=Rules.removeLibraryEntry(S.customLibrary,cur,b.dataset.n); save(); toast('Removed from library');}
  else return; render();
});
// Typed stepper values (main cards): commit on change/blur; do not re-render on every keystroke
document.addEventListener('change',e=>{
  const inp=e.target.closest&&e.target.closest('input.step-in'); if(!inp||!inp.dataset.ex) return;
  const T=S.tabs[cur], ex=T.routine.find(r=>r.id===inp.dataset.ex), d=draft[inp.dataset.ex]; if(!d||!ex) return;
  d[inp.dataset.f]=clampField(inp.dataset.f, inp.value); render();
});
document.addEventListener('keydown',e=>{
  const inp=e.target.closest&&e.target.closest('input.step-in'); if(!inp) return;
  if(e.key==='Enter'){e.preventDefault(); inp.blur();}
});

// FEATURE · Discard workout: the X on the 'Workout in progress' banner opens a themed <dialog> confirm
// ('Keep going' closes it, 'Discard' calls discardWorkout). Rules.discardDraft is pure and unit-tested.
// Discard the in-progress workout: clears the unsaved draft + rest timer only; never touches saved history
function confirmDiscard(){const dlg=$('#dlg');resetDlg(dlg);
  dlg.innerHTML=`<h3>Discard this workout?</h3><p class="mut">Sets logged in this session won't be saved.</p><div class="row" style="margin-top:8px"><button class="ghost" id="discKeep" autofocus>Keep going</button><button class="danger" id="discGo">${ic('x')} Discard</button></div>`;
  dlg.showModal();$('#discKeep').onclick=()=>dlg.close();
  $('#discGo').onclick=()=>{dlg.close();discardWorkout();};}
function discardWorkout(){const r=Rules.discardDraft(draft,draftNotes,cur);draft=r.draft;draftNotes=r.notes;clearDraft();stopTimer();ui.open=null;ui.home=true;render();scrollTo(0,0);toast('Workout discarded');}
function complete(quiet){
  const T=S.tabs[cur], entries=T.routine.filter(r=>draft[r.id]&&draft[r.id].sets.length).map(r=>({exerciseId:r.id,sets:draft[r.id].sets}));
  if(!entries.length) return;
  ui.open=null;ui.home=true;
  const date=today(), recs=Rules.sessionRecords(T.routine,T.sessions,{date,entries}), ex=T.sessions.find(s=>s.date===date);
  if(ex){for(const en of entries){const o=ex.entries.find(x=>x.exerciseId===en.exerciseId);o?o.sets.push(...en.sets):ex.entries.push(en)}} else T.sessions.push({date,entries,local:true});
  const nt=(draftNotes[cur]||'').trim(); if(nt){const s=T.sessions.find(s=>s.date===date);s.notes=s.notes&&s.local?s.notes+'\n'+nt:(s.notes?s.notes+'\n'+nt:nt);s.notesLocal=true;} delete draftNotes[cur];
  T.plans.push({date,items:T.routine.filter(Rules.isActive).map(r=>({id:r.id,name:r.name,unit:r.unit,...Rules.nextPlan(r,T.sessions)}))});
  storeRecords(cur,date,recs); draft={}; clearDraft(); save(); if(!quiet){stopTimer(); toast('Workout saved – next targets set');}
}
function trendHTML(ex,sessions){const t=Rules.trendSeries(ex,sessions);if(t.dates.length<2)return '';
  return `<details class="trend"><summary>${ic('trend')} Trend (${t.dates.length} sessions)</summary>${t.series.map((s,i)=>`<div class="mut">${esc(s.label)}: ${esc(s.values[0])} → ${esc(s.values[s.values.length-1])}</div>
    <svg viewBox="0 0 280 48" width="100%" height="48" role="img" aria-label="${esc(s.label)} trend"><polyline fill="none" stroke="${i?'var(--trend-2)':'var(--acc-text)'}" stroke-width="3" stroke-linejoin="round" points="${Rules.sparkPoints(s.values)}"/></svg>`).join('')}
    ${(()=>{const e=Rules.e1rmSeries(ex,sessions);return e&&e.length>=2?`<div class="mut">Est. 1RM (Brzycki, sets ≤12 reps): ${esc(e[0].v)} → ${esc(e[e.length-1].v)} kg</div><svg viewBox="0 0 280 48" width="100%" height="48" role="img" aria-label="Estimated 1RM trend"><polyline fill="none" stroke="var(--warn)" stroke-width="3" stroke-dasharray="6 4" points="${Rules.sparkPoints(e.map(p=>p.v))}"/></svg>`:''})()}
    <div class="mut">${esc(fmtDate(t.dates[0]))} – ${esc(fmtDate(t.dates[t.dates.length-1]))}</div></details>`;}
function deloadFor(k){const o=(S.deload||{})[k]||{};return Rules.deloadStatus(S.tabs[k].sessions,today(),o);}
let lastRecords=[];
function storeRecords(k,date,recs){ if(!recs.length) return; const s=S.tabs[k].sessions.find(s=>s.date===date); s.records=(s.records||[]).concat(recs); lastRecords=lastRecords.concat(recs.map(r=>({...r,tab:k}))); }
const recTxt=r=>r.type==='weight'?`${esc(r.name)}: top weight ${esc(r.value)} (was ${esc(r.prev)})`:r.type==='reps'?`${esc(r.name)}: ${esc(r.value)} reps in a set (was ${esc(r.prev)})`:`${esc(r.name)}: ${esc(r.value)} kg×reps in a set (was ${esc(r.prev)})`;
// FEATURE · Toasts: short non-blocking messages styled per theme; announced by screen readers via aria-live,
// capped at 3 visible, auto-dismiss after 2.5 s with a fade-out class.
// Themed toasts in a polite live region; CSS lifts the stack above the rest timer when it's showing
function toast(m){const box=$('#toasts'),t=document.createElement('div');t.className='toast';t.textContent=m;
  while(box.children.length>=3)box.firstElementChild.remove();box.append(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),250)},2500)}
// Toast with one action button (e.g. Undo); stays 8 s
function toastAction(m,label,fn,ms=8000){const box=$('#toasts'),t=document.createElement('div');t.className='toast act';
  const sp=document.createElement('span');sp.textContent=m;const b=document.createElement('button');b.type='button';b.className='ghost';b.textContent=label;
  b.onclick=ev=>{ev.stopPropagation();t.remove();fn();};t.append(sp,b);
  while(box.children.length>=3)box.firstElementChild.remove();box.append(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),250)},ms)}
// Every dialog opener clears the previous opener's handlers
function resetDlg(dlg){dlg.onclick=null;dlg.onchange=null;dlg.oncancel=null;}
// Quick log sheet with block selector; per-block entries persist until Save
function openQuick(opts={}){
  const dlg=$('#dlg'); resetDlg(dlg); const Q={}, edited=new Set(), notes={}, deloadTabs=new Set(opts.deload?[opts.deload]:[]); let qb=opts.deload||cur;
  const build=k=>{const T=S.tabs[k];return T.routine.filter(Rules.isActive).map(ex=>{const p=Rules.nextPlan(ex,T.sessions);const it={ex,exerciseId:ex.id,sets:p.sets,reps:p.reps,weight:U(ex.unit).hasWeight?p.weight:0,effort:'Good',last:Rules.lastValues(ex,T.sessions)};
    if(deloadTabs.has(k)){const d=Rules.deloadPrefill(ex,T.sessions);if(d)Object.assign(it,d);}return it;})};
  let date=today(), timerAfter=false;
  const draw=()=>{const q=Q[qb]||(Q[qb]=build(qb));
    const step=[...Object.values(Q)].some(q=>q.some(i=>i.touched))||Rules.draftSetCount(draft)?2:1;
    const tabLabel=TABS.find(t=>t[0]===qb)[1];
    dlg.innerHTML=`<div class="sheet"><div class="sheet-h"><h3>${esc(tabLabel)}</h3><button type="button" class="ghost" id="qCancel">Close</button></div><div class="sheet-b">
    <ol class="steps">${['Pick block','Log sets','Finish'].map((s,i)=>`<li class="${i+1===step?'now':i+1<step?'done':''}">${i+1}. ${s}</li>`).join('')}</ol>
    <div class="help">Choose what you're training. You can switch blocks any time. Entries stay.</div>
    <div class="blocks">${TABS.map(([k,l])=>`<button type="button" data-qb="${k}" class="${k===qb?'on':''}" aria-pressed="${k===qb}">${tabBtn(k,l)}${edited.has(k)?' •':''}</button>`).join('')}</div>
    <div class="qtimer ${tInt?'':'hidden'}">${ic('timer')} Rest <b class="qTimerCount">${tInt?$('#timerCount').textContent:''}</b>s <button type="button" data-qt="skip">Skip</button></div>
    ${deloadTabs.has(qb)?'<div class="banner"><b>'+ic('leaf')+' Deload session</b> – prefilled at −20%. Saved as a deload: no records, ignored by stall checks.</div>':''}
    <div class="help">Tap a row to change numbers. Only rows you touch get saved. Tick done to log a row as shown.</div>
    <label class="mut">Date <input type="date" id="qDate" value="${esc(date)}"></label>
    ${q.map((i,k)=>quickLogger(i,k)).join('')}
    <label class="mut" style="display:block">Notes for this block (optional)<textarea id="qNotes" rows="2">${esc(notes[qb]||'')}</textarea></label>
    <div class="row"><button type="button" class="ghost" data-qt="start">${ic('timer')} Start rest</button><label class="row" style="flex:2;min-height:48px"><input type="checkbox" id="qTimer" ${timerAfter?'checked':''}> Timer after save</label></div>
    <div class="help">Finish saves your workout and sets next time's targets.</div>
    </div><div class="sheet-f"><button type="button" class="primary" id="qSave">${ic('check')} Finish</button></div></div>`;
    $('#qNotes').oninput=ev=>{notes[qb]=ev.target.value;if(ev.target.value.trim())edited.add(qb)};};
  // Esc / Android back / Close ask first when the sheet has entries that would be lost
  const hasEntries=()=>edited.size>0||Object.values(Q).some(q=>q.some(i=>i.touched));
  draw();dlg.showModal();
  dlg.oncancel=ev=>{if(hasEntries()&&!confirm('Close and lose the entries in this sheet?'))ev.preventDefault();else resetDlg(dlg);};
  dlg.onchange=ev=>{const inp=ev.target.closest&&ev.target.closest('input.step-in'); if(!inp||inp.dataset.q==null) return;
    const i=Q[qb][+inp.dataset.q]; if(!i) return; date=$('#qDate').value||today();
    i[inp.dataset.qf]=clampField(inp.dataset.qf, inp.value); i.touched=true; edited.add(qb); draw();};
  dlg.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();
    date=$('#qDate').value||today();timerAfter=$('#qTimer').checked;
    if(b.id==='qCancel'){if(hasEntries()&&!confirm('Close and lose the entries in this sheet?'))return;dlg.close();resetDlg(dlg);return}
    if(b.dataset.qb){qb=b.dataset.qb;draw();return}
    if(b.dataset.qt==='start'){startTimer();draw();return}
    if(b.dataset.qt==='skip'){stopTimer();draw();return}
    if(b.id==='qSave'){const blocks=edited.size?[...edited]:[qb];let n=0;
      if(Rules.draftSetCount(draft)){complete(true);n++;}
      for(const k of blocks){const T=S.tabs[k];const sess=Rules.buildQuickSession(date,Rules.touchedItems(Q[k]),notes[k]);if(!sess.entries.length)continue;if(deloadTabs.has(k))sess.deload=true;
        const recs=Rules.sessionRecords(T.routine,T.sessions,sess);T.sessions=Rules.addSession(T.sessions,sess);storeRecords(k,date,recs);T.plans.push({date,items:T.routine.filter(Rules.isActive).map(r=>({id:r.id,name:r.name,unit:r.unit,...Rules.nextPlan(r,T.sessions)}))});n++;}
      if(!n)return;save();dlg.close();resetDlg(dlg);draft={};clearDraft();render();toast(n>1?n+' sessions saved':'Session saved');if(timerAfter)startTimer();return}
    const i=Q[qb][+b.dataset.q];
    if(b.dataset.qdone){i.touched=!i.touched;if(i.touched)edited.add(qb);else if(!Q[qb].some(x=>x.touched)&&!(notes[qb]||'').trim())edited.delete(qb);draw();return}
    edited.add(qb);i.touched=true;if(b.dataset.qe)i.effort=b.dataset.qe;
    else if(b.dataset.ql&&i.last){i.sets=i.last.sets;i.reps=i.last.reps;i.weight=i.last.weight;}
    else if(b.dataset.qf){const f=b.dataset.qf,st=f==='weight'?U(i.ex.unit).wStep:1;i[f]=Math.max(f==='reps'?1:0,Math.round((i[f]+(+b.dataset.qd)*st)*10)/10);}
    draw();};
}
// Copy session as plain text (current draft if any sets logged, else most recent session)
function copySession(){ const T=S.tabs[cur], label=TABS.find(t=>t[0]===cur)[1];
  const entries=T.routine.filter(r=>draft[r.id]&&draft[r.id].sets.length).map(r=>({exerciseId:r.id,sets:draft[r.id].sets}));
  const sess=entries.length?{date:today(),entries,notes:(draftNotes[cur]||'').trim()}:T.sessions[T.sessions.length-1];
  if(!sess){toast('No session to copy yet');return}
  const txt=Rules.sessionText(label,T.routine,sess);
  const fallback=()=>{const dlg=$('#dlg');resetDlg(dlg);dlg.innerHTML=`<h3>Copy session</h3><p class="mut">Clipboard unavailable – select all and copy.</p><textarea id="copyTxt" readonly>${esc(txt)}</textarea><button class="primary" id="copyClose">Close</button>`;
    dlg.showModal();const ta=$('#copyTxt');ta.focus();ta.select();try{document.execCommand('copy')}catch(e){}$('#copyClose').onclick=()=>dlg.close();};
  if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(txt).then(()=>toast('Session copied'),fallback); else fallback(); }
// Weekly report
function quickLogger(i,k){
  const ex=i.ex, info=U(ex.unit), hasW=!!info.hasWeight;
  const prev=i.last?(hasW?i.last.weight+'\u00d7'+i.last.reps:String(i.last.reps)):'—';
  const n=Math.max(1, Number(i.sets)||1);
  let rows='';
  for(let s=0;s<n;s++){
    const curRow=s===0;
    rows+=`<div class="setrow${curRow?' cur':''}"><span class="sn">${s+1}</span><span class="prev">${esc(prev)}</span>`
      +(hasW?(curRow?`<input class="step-in" type="number" inputmode="decimal" min="0" step="any" data-q="${k}" data-qf="weight" value="${esc(i.weight)}" aria-label="${esc(info.weight)}">`:`<span class="cell quiet">${esc(i.weight)}</span>`):'')
      +(curRow?`<input class="step-in cur" type="number" inputmode="decimal" min="1" step="any" data-q="${k}" data-qf="reps" value="${esc(i.reps)}" aria-label="${esc(info.reps)}">`:`<span class="cell"><i class="pend"></i></span>`)
      +(curRow?`<button type="button" class="tick ${i.touched?'on':''}" data-q="${k}" data-qdone="1" aria-pressed="${!!i.touched}" aria-label="Mark ${esc(ex.name)} done">${i.touched?ic('check'):''}</button>`:`<span class="tick" aria-hidden="true"></span>`)
      +`</div>`;
  }
  return `<div class="card ${i.touched?'touched':''}"><h3>${esc(ex.name)}</h3>
    ${i.last?`<button type="button" class="ghost lastbtn" data-q="${k}" data-ql="1">${ic('undo')} Last time ${esc(fmtDate(i.last.date))}: ${fmtPlan(i.last,ex.unit)}</button>`:'<div class="mut">No previous log</div>'}
    <div class="step"><button type="button" data-q="${k}" data-qf="sets" data-qd="-1" aria-label="less Sets">−</button><div class="v"><input class="step-in" type="number" inputmode="numeric" min="1" step="any" data-q="${k}" data-qf="sets" value="${esc(i.sets)}" aria-label="Sets"><small>Sets</small></div><button type="button" data-q="${k}" data-qf="sets" data-qd="1" aria-label="more Sets">+</button></div>
    <div class="setgrid${hasW?'':' noweight'}"><div class="sethead"><span>Set</span><span>Previous</span>${hasW?`<span>${esc(colW(ex.unit))}</span>`:''}<span>${esc(colR(ex.unit))}</span><span></span></div>${rows}</div>
    <div class="eff">${['Ok','Good','Tough'].map(e=>`<button type="button" class="${i.effort===e?'on':''}" aria-pressed="${i.effort===e}" data-q="${k}" data-qe="${e}">${e}</button>`).join('')}</div></div>`;
}
function reportCard(inline){const r=Rules.weeklyReport(S.tabs,today());
  const inner=`<h3>${ic('calendar')} Weekly report · ${esc(fmtRange(r.start,r.end))}</h3>
    <div class="kpis"><div><b>${esc(r.sessions)}</b><small>sessions</small></div><div><b>${esc(r.sets)}</b><small>sets</small></div><div><b>${esc(Number(r.volume).toLocaleString())}</b><small>kg volume</small></div><div><b>${r.records.length}</b><small>records</small></div></div>
    ${r.minutes?`<div class="mut">Cardio: ${esc(r.minutes)} min</div>`:''}
    <div class="mut">${TABS.filter(([k])=>r.byTab[k]).map(([k,l])=>l+' ×'+r.byTab[k]).join(' · ')||'No sessions yet this week'}</div>
    ${r.records.map(x=>`<div>${ic('trophy')} ${recTxt(x)}</div>`).join('')}
    ${inline?'<button type="button" class="ghost" data-act="repok" style="width:100%;margin-top:8px">Dismiss until next week</button>':''}`;
  return inline?`<div class="card report">${inner}</div>`:`<div class="report bare">${inner}</div>`;
}
function openReport(){const dlg=$('#dlg');resetDlg(dlg);dlg.innerHTML=reportCard(false)+'<button class="primary" id="repClose">Close</button>';dlg.showModal();$('#repClose').onclick=()=>dlg.close();}
// FEATURE · Rest timer pill: starts after each logged set; counts down from the saved rest (60–90 s),
// −15s/+15s nudge only the running countdown, Skip stops it, and the pin toggles a floating pill vs a docked bar.
// Uses a wall-clock end time (tEnd) so the count stays accurate if the tab is throttled; ends with vibrate + beep.
// Rest timer
let tEnd=0,tInt=null,actx;
function parkTimer(){
  const t=$('#timer'), host=$('#toasts');
  if(t && host && t.parentElement!==document.body) document.body.insertBefore(t, host);
}
function placeChrome(){
  const wide=matchMedia('(min-width:1024px)').matches;
  document.body.classList.toggle('wide', wide);
  const pane=$('#pane'), t=$('#timer'), host=$('#toasts');
  if(wide && pane && !pane.hidden && t) pane.append(t);
  else if(t && host && t.parentElement!==document.body) document.body.insertBefore(t, host);
  syncTimerPad();
}
function syncTimerPad(){
  const t=$('#timer'); if(!t) return;
  const wide=document.body.classList.contains('wide');
  const docked=!t.classList.contains('hidden') && !t.classList.contains('float') && !wide;
  document.body.classList.toggle('timer-docked', docked);
  if(docked) document.documentElement.style.setProperty('--timer-h', (t.offsetHeight+8)+'px');
}
function startTimer(){stopTimer();tEnd=Date.now()+S.restSec*1e3;$('#timer').classList.remove('hidden');document.querySelectorAll('.qtimer').forEach(x=>x.classList.remove('hidden'));tick();tInt=setInterval(tick,250);
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}
  requestAnimationFrame(syncTimerPad);}
function tick(){const s=Math.max(0,Math.ceil((tEnd-Date.now())/1e3));$('#timerCount').textContent=s;document.querySelectorAll('.qTimerCount').forEach(x=>x.textContent=s);if(s<=0){stopTimer();buzz()}}
function stopTimer(){clearInterval(tInt);tInt=null;$('#timer').classList.add('hidden');document.querySelectorAll('.qtimer').forEach(x=>x.classList.add('hidden'));syncTimerPad()}
function buzz(){try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}
  try{if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=660;g.gain.setValueAtTime(0.0001,actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15,actx.currentTime+0.05);g.gain.exponentialRampToValueAtTime(0.0001,actx.currentTime+0.6);o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+0.65)}catch(e){}}
$('#skipBtn').onclick=stopTimer;
// ±15 s nudges the running countdown only; S.restSec (the saved default) is untouched
const nudge=sec=>{if(!tInt)return;tEnd=Math.max(Date.now(),tEnd+sec*1e3);tick()};
$('#tMinus').onclick=()=>nudge(-15);$('#tPlus').onclick=()=>nudge(15);
// Float timer preference (own key; never touches workout data)
const FLOAT_KEY=KEY+'.timerFloat';
function applyFloat(on){$('#timer').classList.toggle('float',on);$('#floatBtn').setAttribute('aria-pressed',on);$('#floatBtn').title=on?'Dock timer to full-width bar':'Float timer';syncTimerPad()}
applyFloat(localStorage.getItem(FLOAT_KEY)==='1');
$('#floatBtn').onclick=()=>{const on=!$('#timer').classList.contains('float');localStorage.setItem(FLOAT_KEY,on?'1':'0');applyFloat(on)};
// Import / export / absence dialogs
// FEATURE · Import (1.18.0): the app's own Export JSON restores everything (after a confirm, previous data kept in
// KEY.pre-restore); single-tab JSON is validated session by session and CSV is parsed quote-aware, filtered to this
// tab's rows. Before any tab import the whole state is kept in KEY.pre-import for a one-step Undo.
function openImport(){const dlg=$('#dlg');resetDlg(dlg);const canUndo=!!localStorage.getItem(KEY+'.pre-import');
  dlg.innerHTML=`<h3>Import ${TABS.find(t=>t[0]===cur)[1]} log</h3>
  <p class="mut">Paste or pick a full backup (Export JSON – restores everything), a tab log as JSON ({routine, sessions}) or CSV (date,exercise,set,reps,weight,effort[,tab]). A tab log replaces this tab's sessions; you can undo it once.</p>
  <input type="file" id="impFile" accept=".json,.csv,application/json,text/csv"><textarea id="impTxt" class="mono" placeholder="Paste here"></textarea>
  <div class="row" style="margin-top:8px"><button class="ghost" id="impCancel">Cancel</button><button class="primary" id="impGo">Import</button></div>
  ${canUndo?`<button class="ghost" id="impUndo" style="width:100%;margin-top:8px">${ic('undo')} Undo last import</button>`:''}<div id="impErr" role="alert" style="color:var(--bad)"></div>`;
  dlg.showModal();$('#impCancel').onclick=()=>dlg.close();
  if(canUndo)$('#impUndo').onclick=()=>{dlg.close();undoImport();};
  $('#impFile').onchange=async ev=>{const f=ev.target.files[0];if(f)$('#impTxt').value=await f.text()};
  $('#impGo').onclick=async()=>{try{const r=await importText($('#impTxt').value);if(r==='cancelled')return;dlg.close();draft={};draftNotes={};clearDraft();render();
      if(r==='restored')toast('Backup restored');else toastAction('Imported '+r.n+' session'+(r.n===1?'':'s'),'Undo',undoImport);}
    catch(err){console.warn(err);$('#impErr').textContent=err.message}};}
async function importText(txt){
  const T=S.tabs[cur];txt=String(txt||'').trim();if(!txt)throw new Error('Nothing to import');
  if(txt[0]==='{'||txt[0]==='['){let d;try{d=JSON.parse(txt)}catch(e){throw new Error('That JSON could not be read: '+e.message)}
    if(Rules.isFullBackup(d)){const clean=Rules.sanitizeBackup(d);
      const n=Object.values(clean.tabs).reduce((a,t)=>a+t.sessions.length,0);
      if(!confirm(`Replace ALL data on this phone with this backup (${n} sessions)? Your current data is kept for recovery.`)) return 'cancelled';
      keepCopy('.pre-restore',JSON.stringify(S));const prev=S;S=clean;await upgrade();
      if(!save()){S=prev;throw new Error('Could not save the restored backup – nothing changed.')}
      localStorage.removeItem(KEY+'.pre-import');return 'restored';}
    const v=Rules.validateTabImport(d);
    keepCopy('.pre-import',JSON.stringify(S));
    if(v.routine)T.routine=v.routine; T.sessions=v.sessions; T._example=false;T.plans=[];
    if(!save())throw new Error('Could not save the import.');return {n:v.sessions.length};}
  const r=Rules.parseCSV(txt,cur);
  if(!r.sessions.length)throw new Error(r.tabs.length&&!r.tabs.includes(cur)?`No rows for this tab in the CSV (it has: ${r.tabs.join(', ')}). Switch tab and import again.`:'No valid CSV rows found (dates must be YYYY-MM-DD)');
  // Map CSV exercise names onto existing routine ids (so an exported CSV round-trips), add new exercises, keep the rest of the routine
  const byName=new Map(T.routine.map(x=>[String(x.name).toLowerCase(),x.id])), idMap={};
  for(const [id,name] of Object.entries(r.names)) idMap[id]=T.routine.some(x=>x.id===id)?id:(byName.get(name.toLowerCase())||id);
  r.sessions.forEach(s=>s.entries.forEach(e=>{e.exerciseId=idMap[e.exerciseId]}));
  const routine=[...T.routine];
  for(const [id,name] of Object.entries(r.names)){const nid=idMap[id]; if(routine.some(x=>x.id===nid))continue;
    const last=r.sessions.flatMap(s=>s.entries.filter(e=>e.exerciseId===nid).map(e=>e.sets)).pop()||[];
    routine.push({id:nid,name,targetSets:last.length||3,targetReps:Math.max(1,...last.map(s=>s.reps)),unit:r.units[id]||(last.some(s=>s.weight>0)?'kg':'bodyweight')});}
  keepCopy('.pre-import',JSON.stringify(S));
  T.routine=routine;T.sessions=r.sessions;T._example=false;T.plans=[];
  if(!save())throw new Error('Could not save the import.');return {n:r.sessions.length};
}
function undoImport(){const raw=localStorage.getItem(KEY+'.pre-import');if(!raw){toast('Nothing to undo');return}
  try{const prev=JSON.parse(raw);if(!Rules.isFullBackup(prev))throw new Error('bad copy');S=prev;if(!save())return;localStorage.removeItem(KEY+'.pre-import');draft={};draftNotes={};clearDraft();render();toast('Import undone');}
  catch(e){console.warn(e);toast('Could not undo the import');}}
// Rescue/raw export: every willsBody.* key exactly as stored (works even when the data can't be parsed)
function exportRaw(){const out={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(KEY))out[k]=localStorage.getItem(k);}
  dl('wills-body-raw-'+today()+'.json','application/json',JSON.stringify(out,null,2));}
function dl(name,type,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
$('#csvBtn').onclick=()=>S&&dl('wills-body-'+today()+'.csv','text/csv',Rules.toCSV(S.tabs));
$('#reportBtn').onclick=()=>S&&openReport();
$('#stats').onclick=()=>{if(!S)return;S.statsWindow=S.statsWindow===7?30:S.statsWindow===30?90:7;save();render();};
$('#exportBtn').onclick=()=>!S?exportRaw():dl('wills-body-backup-'+today()+'.json','application/json',JSON.stringify(S,null,2));
$('#absenceBtn').onclick=()=>{if(!S)return;const dlg=$('#dlg');resetDlg(dlg);dlg.innerHTML=`<h3>Log absence</h3><p class="mut">Weeks with a work or holiday absence don't break your streak.</p>
  <input type="date" id="absDate" value="${today()}"><div class="row" style="margin-top:10px"><button data-tag="work">${ic('briefcase')} Work</button><button data-tag="holiday">${ic('umbrella')} Holiday</button></div>
  <div class="mut" style="margin-top:8px">${S.absences.slice(-5).map(a=>esc(fmtDate(a.date))+' '+esc(a.tag)).join('<br>')}</div><button type="button" class="ghost" style="width:100%;margin-top:8px" id="absClose">Close</button>`;
  dlg.showModal();$('#absClose').onclick=()=>dlg.close();
  dlg.querySelectorAll('[data-tag]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();S.absences.push({date:$('#absDate').value,tag:b.dataset.tag});save();dlg.close();render()});};
// Theme (default dark, persisted)
const THEME_KEY=KEY+'.theme';
function syncThemeColor(){
  const root=document.documentElement, light=root.dataset.theme==='light', shine=root.dataset.shine==='reduced';
  const bg=shine?(light?'#FFFFFF':'#000000'):(light?'#F3F0E8':'#14130F');
  const m=document.querySelector('meta[name=theme-color]'); if(m) m.content=bg;
}
function applyTheme(t){document.documentElement.dataset.theme=t;$('#themeBtn').innerHTML=ic(t==='light'?'moon':'sun');$('#themeBtn').setAttribute('aria-label','Switch to '+(t==='light'?'dark':'light')+' theme');syncThemeColor()}
applyTheme(localStorage.getItem(THEME_KEY)==='light'?'light':'dark');
$('#themeBtn').onclick=()=>{const t=document.documentElement.dataset.theme==='light'?'dark':'light';localStorage.setItem(THEME_KEY,t);applyTheme(t)};
// FEATURE · Reduce shine: swaps the metallic gradients for flat, high-contrast colours via html[data-shine=reduced]
// (CSS does the styling). An inline script in index.html applies it before first paint to avoid a flash.
// Reduce shine: flat high-contrast look. Explicit choice saved in its own key; unset follows prefers-contrast: more
const SHINE_KEY=KEY+'.reduceShine', hiContrast=matchMedia('(prefers-contrast: more)');
function applyShine(){const v=localStorage.getItem(SHINE_KEY), on=v==null?hiContrast.matches:v==='1';
  if(on)document.documentElement.dataset.shine='reduced';else delete document.documentElement.dataset.shine;
  $('#shineBtn').setAttribute('aria-pressed',on);$('#shineBtn').title=on?'Restore shine':'Reduce shine';syncThemeColor()}
$('#shineBtn').innerHTML=ic('contrast');applyShine();
$('#shineBtn').onclick=()=>{localStorage.setItem(SHINE_KEY,document.documentElement.dataset.shine==='reduced'?'0':'1');applyShine()};
hiContrast.addEventListener&&hiContrast.addEventListener('change',applyShine);
$('#floatBtn').innerHTML=ic('pin');
for(const [id,n] of [['absenceBtn','calx'],['reportBtn','calendar'],['csvBtn','download'],['exportBtn','download']])$('#'+id).insertAdjacentHTML('afterbegin',ic(n)+' ');
const sl=$('#restSlider');
fetch('manifest.webmanifest').then(r=>r.json()).then(m=>{$('#ver').textContent="Will's Body v"+m.version}).catch(()=>{});
load().then(()=>{document.body.classList.remove('loading');sl.value=S.restSec;$('#restVal').textContent=S.restSec;
  const n=restoreDraft();render();if(n)toast(`Workout in progress restored · ${n} set${n>1?'s':''}`);})
  .catch(err=>{console.error('load failed',err);S=undefined;document.body.classList.remove('loading');const m=$('#main');m.removeAttribute('aria-busy');
    m.innerHTML=`<div class="card notice"><h3>${ic('alert')} Couldn't load your data</h3><div class="help">Nothing has been deleted. Export the raw copy and keep it safe, then reload.</div><div class="row"><button class="primary" id="rescueBtn">${ic('download')} Export raw backup</button><button class="ghost" id="reloadBtn">Reload</button></div></div>`;
    $('#rescueBtn').onclick=exportRaw;$('#reloadBtn').onclick=()=>location.reload();});
// Ask the browser not to evict this app's storage (granted silently for installed PWAs on most browsers)
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persisted().then(p=>p||navigator.storage.persist()).catch(()=>{})}catch(e){}
sl.oninput=()=>{if(!S)return;S.restSec=+sl.value;$('#restVal').textContent=sl.value;save();if(tInt){/*keep running*/}};
addEventListener('resize',()=>{if(!S)return;const w=matchMedia('(min-width:1024px)').matches;if(w!==document.body.classList.contains('wide'))render();else syncTimerPad();});
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
