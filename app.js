'use strict';
const KEY='willsBody.v1', TABS=[['arms','Arms'],['chest-back','Chest & Back'],['shoulders','Shoulders'],['bodyweight','Bodyweight'],['equipment','Equipment']];
const ICONS={arms:'💪','chest-back':'🏋️',shoulders:'🙆',bodyweight:'🤸',equipment:'🚴'};
const SHY={Bodyweight:'Body&shy;weight',Equipment:'Equip&shy;ment',Shoulders:'Shoul&shy;ders'};
const tabBtn=(k,l)=>`<span class="ti" aria-hidden="true">${ICONS[k]}</span><span class="tl">${SHY[l]||esc(l)}</span>`;
let draftNotes={};
let S, cur=localStorage.getItem(KEY+'.tab')||'arms', draft={}, ui={}; // draft: exId -> {sets:[], reps, weight, effort, targetSets}
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
async function load(){
  try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}
  if(!S||S.version!==2){S={version:2,tabs:{},absences:[],restSec:75};
    for(const [k] of TABS){let d={_example:true,routine:[],sessions:[]};try{d=await (await fetch('data/'+k+'.json')).json()}catch(e){}
      S.tabs[k]={_example:!!d._example,routine:d.routine||[],sessions:d.sessions||[],plans:[],dismissed:[],seedVersion:d.seedVersion||1,seedDates:(d.sessions||[]).map(s=>s.date)};}
    save();}
  // Add tabs introduced after this phone's data was created (e.g. Equipment) without touching others
  for(const [k] of TABS){ if(S.tabs[k]) continue; let d={routine:[],sessions:[]};
    try{d=await (await fetch('data/'+k+'.json',{cache:'no-cache'})).json()}catch(e){}
    S.tabs[k]={_example:!!d._example,routine:d.routine||[],sessions:d.sessions||[],plans:[],dismissed:[],seedVersion:d.seedVersion||1,seedDates:(d.sessions||[]).map(s=>s.date)}; save(); }
  S.weeklyTarget=S.weeklyTarget||3; S.statsWindow=S.statsWindow||30;
  // Seed-version migration: replace seeded sessions with newer seed, keep phone-logged sessions
  for(const [k] of TABS){const t=S.tabs[k];if(!t)continue;
    try{const d=await (await fetch('data/'+k+'.json',{cache:'no-cache'})).json();
      if((d.seedVersion||1)>(t.seedVersion||1)&&!d._example){S.tabs[k]=Rules.mergeSeed(t,d);save();}}catch(e){}}
  // Upgrade untouched example tabs to real seed data without wiping user logs
  for(const [k] of TABS){const t=S.tabs[k];if(!t||!t._example||t.sessions.length)continue;
    try{const d=await (await fetch('data/'+k+'.json',{cache:'no-cache'})).json();
      if(!d._example){S.tabs[k]={_example:false,routine:d.routine||[],sessions:d.sessions||[],plans:[],dismissed:t.dismissed||[],seedVersion:d.seedVersion||1,seedDates:(d.sessions||[]).map(s=>s.date)};save();}}catch(e){}}
}
const U=Rules.unitInfo;
const fmtPlan=(p,u)=>u==='kg'?`${p.sets}×${p.reps} @ ${p.weight}kg`:u==='level'?`${p.sets}× ${p.reps} min @ L${p.weight}`:`${p.sets}×${p.reps}${U(u).short?' '+U(u).short:''}`;
function fmtSets(sets,u){return sets.map(x=>`<span class="chip">${Rules.fmtSet(x,u)}${x.effort?' · '+x.effort:''}</span>`).join('')}
function render(){
  const T=S.tabs[cur], allDates=Object.values(S.tabs).flatMap(t=>t.sessions.map(s=>s.date));
  $('#streak').textContent='🔥 '+Rules.weeklyStreak(allDates,S.absences,today())+' wk streak';
  const st=Rules.workoutStats(S.tabs,S.absences,today(),S.statsWindow,S.weeklyTarget);
  $('#stats').textContent=`💪 ${st.done} in ${st.days}d${st.pct==null?'':' · '+st.pct+'%'}`; $('#stats').title=`${st.done} workouts / ${st.planned} planned (${S.weeklyTarget}/week, absence weeks excluded). Tap to change window.`;
  $('#tabs').innerHTML=TABS.map(([k,l])=>`<button role="tab" aria-selected="${k===cur}" data-tab="${k}">${tabBtn(k,l)}</button>`).join('');
  let h='';
  const lastS=T.sessions[T.sessions.length-1], tabLabel=TABS.find(t=>t[0]===cur)[1];
  h+=`<div class="tabhead"><h2>${tabLabel}</h2><div class="mut">${Rules.activeSlots(T.routine)}/${Rules.MAX_ACTIVE} active · ${T.sessions.length} sessions · last ${lastS?lastS.date:'—'}</div></div>`;
  h+=`<div class="strip" aria-label="This week per tab">${Rules.weekStrip(S.tabs,TABS.map(t=>t[0]),today()).map(c=>{const l=TABS.find(t=>t[0]===c.tab)[1];
    return `<button data-tab="${c.tab}" aria-label="${l}" class="cell ${c.neglected?'neglected':'lvl'+Math.min(3,c.sessions)} ${c.tab===cur?'cur':''}" title="${l}: ${c.sessions} sessions, ${c.volume} kg, ${c.minutes} min"><span>${SHY[l]||l}</span><b>${c.sessions}</b><small>${c.neglected?'neglected':c.volume?Math.round(c.volume)+' kg':c.minutes?c.minutes+' min':'done'}</small></button>`}).join('')}</div>`;
  h+=`<button class="ghost" data-act="copy" style="width:100%;margin:4px 0">📋 Copy session</button>`;
  const dl=deloadFor(cur);
  if(dl.due) h+=`<div class="card deload"><h3>🧘 Deload week due</h3><div class="help">${dl.weeks} training weeks since ${dl.anchor}. Do one lighter session at −20% weight to recover; it won't count for records or stall checks.</div>
    <button class="primary" data-act="deload">Plan deload session</button><div class="row" style="margin-top:8px"><button class="ghost" data-act="dlsnooze">Snooze 1 week</button><button class="ghost" data-act="dlskip">Skip this cycle</button></div></div>`;
  if(lastRecords.length) h+=`<div class="card record"><h3>🏆 New record${lastRecords.length>1?'s':''}!</h3>${lastRecords.map(r=>`<div>${recTxt(r)}</div>`).join('')}<button class="ghost" data-act="recok" style="margin-top:8px;width:100%">Nice – dismiss</button></div>`;
  const wk=Rules.isoWeek(today());
  if(new Date().getDay()===0 && S.reportDismissed!==wk) h+=reportCard(true);
  if(T._example) h+=`<div class="banner"><span>Example routine – import your log</span><button data-act="import">Import</button></div>`;
  const nDraft=Rules.draftSetCount(draft);
  if(nDraft) h+=`<div class="inprog"><div><b>Workout in progress · ${nDraft} set${nDraft>1?'s':''}</b><div class="help">Finish saves your workout and sets next time's targets.</div></div><button class="primary" data-act="complete">✓ Finish workout</button></div>`;
  else h+=`<button class="primary" data-act="quick" style="margin:8px 0">▶ Start workout</button><div class="help">Pick a block, log your sets, then Finish.</div>`;
  for(const c of Rules.plateauCards(cur,T.routine,T.sessions,T.dismissed))
    h+=`<div class="card sugg"><h3>🔁 Time to change this exercise</h3><div class="mut">${esc(c.reason)}</div>${c.alternatives.map(x=>`<div class="row" style="margin-top:8px"><span>${esc(x.name)}${x.source==='library'?'':' <span class=mut>(alt)</span>'}</span><button data-act="swap" data-from="${c.exerciseId}" data-n="${esc(x.name)}">Swap in</button><button class="ghost" data-act="dismiss" data-n="${esc(x.name)}" aria-label="Dismiss">✕</button></div>`).join('')}</div>`;
  const stalledIds=new Set(Rules.plateauCards(cur,T.routine,T.sessions,T.dismissed).map(c=>c.exerciseId));
  for(const s of Rules.suggestions(cur,T.routine,T.sessions,T.dismissed).filter(s=>!stalledIds.has(s.exerciseId)))
    h+=`<div class="card sugg"><h3>💡 Try ${esc(s.exercise)}</h3><div class="mut">${esc(s.reason)}</div><div class="row" style="margin-top:8px">
      <button data-act="up" data-n="${esc(s.exercise)}" data-from="${s.exerciseId}">👍 ${Rules.activeSlots(T.routine)>=Rules.MAX_ACTIVE?'Swap in':'Add'}</button><button data-act="dismiss" data-n="${esc(s.exercise)}">✕ Dismiss</button></div></div>`;
  const snap=T.plans[T.plans.length-1];
  if(snap) h+=`<div class="card"><h3>Saved plan for next session</h3><div class="mut">Snapshot from ${snap.date}</div>${snap.items.map(i=>`<div>${esc(i.name)}: <span class="plan">${fmtPlan(i,i.unit)}</span></div>`).join('')}</div>`;
  for(const ex of T.routine.filter(Rules.isActive)){
    const hist=Rules.history(ex.id,T.sessions), last=hist[hist.length-1], plan=Rules.nextPlan(ex,T.sessions);
    const d=draft[ex.id]||(draft[ex.id]={sets:[],reps:plan.reps,weight:plan.weight,effort:'Good',targetSets:plan.sets});
    const flags=Rules.detectPlateaus(ex,T.sessions);
    h+=`<div class="card"><h3>${esc(ex.name)}</h3><div class="mut">Routine: ${ex.targetSets} × ${ex.repMin&&ex.repMin!==ex.repMax?ex.repMin+'–':''}${ex.targetReps} ${U(ex.unit).reps.toLowerCase()}</div>
      <div class="mut">Last: ${last?last.date+'</div><div class="sets">'+fmtSets(last.sets,ex.unit):'none yet'}</div>
      <div><button class="ghost" style="float:right;min-height:40px" data-act="toggle" data-ex="${ex.id}" aria-label="Deactivate">✕</button>Next: <span class="plan">${fmtPlan(plan,ex.unit)}</span> <span class="mut">${esc(plan.note)}</span></div>
      ${trendHTML(ex,T.sessions)}
      ${flags.map(f=>`<div style="color:var(--warn)">⚠ ${esc(f.reason)}</div>`).join('')}
      ${(()=>{const rl=Rules.recentLast(ex,T.sessions,today());return rl?`<button class="ghost lastbtn" data-act="fill" data-ex="${ex.id}">↺ Same as last time (${rl.date}): ${fmtPlan(rl,ex.unit)}</button>`:''})()}
      ${stepper(ex.id,'targetSets','Sets',d.targetSets)}${stepper(ex.id,'reps',U(ex.unit).reps,d.reps)}
      ${U(ex.unit).hasWeight?stepper(ex.id,'weight',U(ex.unit).weight,d.weight):''}
      <div class="eff">${['Ok','Good','Tough'].map(e=>`<button class="${d.effort===e?'on':''}" data-act="eff" data-ex="${ex.id}" data-v="${e}">${e}</button>`).join('')}</div>
      <button class="primary" data-act="log" data-ex="${ex.id}">Log set ${Math.min(d.sets.length+1,99)} of ${d.targetSets}</button>
      <div class="sets">${fmtSets(d.sets,ex.unit)}${d.sets.length?`<button data-act="undo" data-ex="${ex.id}">Undo</button>`:''}</div></div>`;
  }
  const inactive=T.routine.filter(r=>!Rules.isActive(r));
  if(inactive.length) h+=`<details class="card"><summary>Inactive / optional (${inactive.length}) – max 4 active</summary>${inactive.map(r=>`<div class="row" style="margin-top:6px"><span>${esc(r.name)}</span><button class="ghost" data-act="toggle" data-ex="${r.id}">Activate</button></div>`).join('')}</details>`;
  const any=T.routine.some(r=>draft[r.id]&&draft[r.id].sets.length);
  if(any) h+=`<label class="mut" style="display:block;margin:8px 0">Workout notes (optional)<textarea id="sessNotes" rows="2" style="min-height:64px">${esc(draftNotes[cur]||'')}</textarea></label>`;
  h+=`<div class="row" style="margin:12px 0"><button class="ghost" data-act="import">Import log</button></div>`;
  const hist=[...T.sessions].reverse();
  if(hist.length) h+=`<details class="card"><summary>Session history (${hist.length})</summary>${hist.map(s=>`<div class="hist"><b>${s.date}</b>${s.label?' · '+esc(s.label):''}<div class="mut">${s.entries.map(e=>{const r=T.routine.find(x=>x.id===e.exerciseId);return esc(r?r.name:e.exerciseId)+' '+e.sets.length+'×'+(e.sets[0]?e.sets[0].reps:'')+(e.sets[0]&&e.sets[0].weight?' @'+e.sets[0].weight+'kg':'')}).join(' · ')}</div>${s.notes?`<div class="note">📝 ${esc(s.notes)}</div>`:''}</div>`).join('')}</details>`;
  $('#main').innerHTML=h;
  if(celebrate){celebrate=false;confetti();}
  const sn=$('#sessNotes'); if(sn) sn.oninput=()=>{draftNotes[cur]=sn.value};
}
function stepper(id,f,label,v){return `<div class="step"><button data-act="dec" data-ex="${id}" data-f="${f}" aria-label="less ${label}">−</button><div class="v">${v}<small>${label}</small></div><button data-act="inc" data-ex="${id}" data-f="${f}" aria-label="more ${label}">+</button></div>`}
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return; const T=S.tabs[cur];
  if(b.dataset.tab){cur=b.dataset.tab;localStorage.setItem(KEY+'.tab',cur);render();scrollTo(0,0);return}
  const a=b.dataset.act, d=draft[b.dataset.ex], ex=T.routine.find(r=>r.id===b.dataset.ex);
  if(a==='inc'||a==='dec'){const f=b.dataset.f, st=f==='weight'?U(ex.unit).wStep:1, sg=a==='inc'?1:-1;d[f]=Math.max(f==='weight'?0:1,Math.round((d[f]+sg*st)*10)/10);}
  else if(a==='eff') d.effort=b.dataset.v;
  else if(a==='fill'){const l=Rules.lastValues(ex,T.sessions);if(l){d.targetSets=l.sets;d.reps=l.reps;d.weight=l.weight;}}
  else if(a==='copy'){copySession();return}
  else if(a==='log'){d.sets.push({reps:d.reps,weight:U(ex.unit).hasWeight?d.weight:0,effort:d.effort});startTimer();}
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
  else if(a==='toggle'){const r=T.routine.find(r=>r.id===b.dataset.ex);if(r.active===false){if(Rules.activeSlots(T.routine)>=Rules.MAX_ACTIVE){toast('Max 4 exercises – deactivate one first');return}r.active=true;}else r.active=false;save();}
  else if(a==='dismiss'){T.dismissed.push(b.dataset.n);save();}
  else if(a==='complete') complete();
  else if(a==='import') openImport();
  else return; render();
});
function complete(quiet){
  const T=S.tabs[cur], entries=T.routine.filter(r=>draft[r.id]&&draft[r.id].sets.length).map(r=>({exerciseId:r.id,sets:draft[r.id].sets}));
  if(!entries.length) return;
  const date=today(), recs=Rules.sessionRecords(T.routine,T.sessions,{date,entries}), ex=T.sessions.find(s=>s.date===date);
  if(ex){for(const en of entries){const o=ex.entries.find(x=>x.exerciseId===en.exerciseId);o?o.sets.push(...en.sets):ex.entries.push(en)}} else T.sessions.push({date,entries,local:true});
  const nt=(draftNotes[cur]||'').trim(); if(nt){const s=T.sessions.find(s=>s.date===date);s.notes=s.notes&&s.local?s.notes+'\n'+nt:(s.notes?s.notes+'\n'+nt:nt);s.notesLocal=true;} delete draftNotes[cur];
  T.plans.push({date,items:T.routine.filter(Rules.isActive).map(r=>({id:r.id,name:r.name,unit:r.unit,...Rules.nextPlan(r,T.sessions)}))});
  storeRecords(cur,date,recs); draft={}; save(); if(!quiet){stopTimer(); toast('Workout saved – next targets set');}
}
function trendHTML(ex,sessions){const t=Rules.trendSeries(ex,sessions);if(t.dates.length<2)return '';
  return `<details class="trend"><summary>📈 Trend (${t.dates.length} sessions)</summary>${t.series.map((s,i)=>`<div class="mut">${s.label}: ${s.values[0]} → ${s.values[s.values.length-1]}</div>
    <svg viewBox="0 0 280 48" width="100%" height="48" role="img" aria-label="${s.label} trend"><polyline fill="none" stroke="${i?'var(--acc2)':'var(--acc)'}" stroke-width="3" stroke-linejoin="round" points="${Rules.sparkPoints(s.values)}"/></svg>`).join('')}
    ${(()=>{const e=Rules.e1rmSeries(ex,sessions);return e&&e.length>=2?`<div class="mut">Est. 1RM (Brzycki, sets ≤12 reps): ${e[0].v} → ${e[e.length-1].v} kg</div><svg viewBox="0 0 280 48" width="100%" height="48" role="img" aria-label="Estimated 1RM trend"><polyline fill="none" stroke="var(--warn)" stroke-width="3" stroke-dasharray="6 4" points="${Rules.sparkPoints(e.map(p=>p.v))}"/></svg>`:''})()}
    <div class="mut">${t.dates[0]} → ${t.dates[t.dates.length-1]}</div></details>`;}
function deloadFor(k){const o=(S.deload||{})[k]||{};return Rules.deloadStatus(S.tabs[k].sessions,today(),o);}
let lastRecords=[], celebrate=false;
function storeRecords(k,date,recs){ if(!recs.length) return; const s=S.tabs[k].sessions.find(s=>s.date===date); s.records=(s.records||[]).concat(recs); celebrate=true; lastRecords=lastRecords.concat(recs.map(r=>({...r,tab:k}))); }
const recTxt=r=>r.type==='weight'?`${esc(r.name)}: top weight ${r.value} (was ${r.prev})`:r.type==='reps'?`${esc(r.name)}: ${r.value} reps in a set (was ${r.prev})`:`${esc(r.name)}: ${r.value} kg×reps in a set (was ${r.prev})`;
function confetti(){ if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box=document.createElement('div');box.className='confetti';box.setAttribute('aria-hidden','true');
  const cols=['#22c55e','#60a5fa','#f59e0b','#f472b6','#facc15'];
  for(let i=0;i<40;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=cols[i%5];p.style.animationDelay=(Math.random()*0.4)+'s';p.style.transform=`rotate(${Math.random()*360}deg)`;box.append(p);}
  document.body.append(box);setTimeout(()=>box.remove(),2200);}
function toast(m){const t=document.createElement('div');t.textContent=m;t.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#14532d;color:#fff;padding:12px 18px;border-radius:12px;z-index:20;font-weight:700';document.body.append(t);setTimeout(()=>t.remove(),2500)}
// Quick log sheet with block selector; per-block entries persist until Save
function openQuick(opts={}){
  const dlg=$('#dlg'), Q={}, edited=new Set(), notes={}, deloadTabs=new Set(opts.deload?[opts.deload]:[]); let qb=opts.deload||cur;
  const build=k=>{const T=S.tabs[k];return T.routine.filter(Rules.isActive).map(ex=>{const p=Rules.nextPlan(ex,T.sessions);const it={ex,exerciseId:ex.id,sets:p.sets,reps:p.reps,weight:U(ex.unit).hasWeight?p.weight:0,effort:'Good',last:Rules.lastValues(ex,T.sessions)};
    if(deloadTabs.has(k)){const d=Rules.deloadPrefill(ex,T.sessions);if(d)Object.assign(it,d);}return it;})};
  const qs=(k,f,l,v)=>`<div class="step"><button data-q="${k}" data-qf="${f}" data-qd="-1">−</button><div class="v">${v}<small>${l}</small></div><button data-q="${k}" data-qf="${f}" data-qd="1">+</button></div>`;
  let date=today(), timerAfter=false;
  const draw=()=>{const q=Q[qb]||(Q[qb]=build(qb));
    const step=[...Object.values(Q)].some(q=>q.some(i=>i.touched))||Rules.draftSetCount(draft)?2:1;
    dlg.innerHTML=`<h3>Workout</h3>
    <ol class="steps">${['Pick block','Log sets','Finish'].map((s,i)=>`<li class="${i+1===step?'now':i+1<step?'done':''}">${i+1}. ${s}</li>`).join('')}</ol>
    <div class="help">1 · Choose what you're training. You can switch blocks any time – your entries stay.</div>
    <div class="blocks">${TABS.map(([k,l])=>`<button data-qb="${k}" class="${k===qb?'on':''}">${tabBtn(k,l)}${edited.has(k)?' •':''}</button>`).join('')}</div>
    <div class="qtimer ${tInt?'':'hidden'}">⏱ Rest <b class="qTimerCount">${tInt?$('#timerCount').textContent:''}</b>s <button data-qt="skip">Skip</button></div>
    ${deloadTabs.has(qb)?'<div class="card deload"><b>🧘 Deload session</b> – prefilled at −20%. Saved as a deload: no records, ignored by stall checks.</div>':''}
    <div class="help">2 · Tap a row to change numbers. Only rows you touch get saved – tick Done to log a row as shown.</div>
    <label class="mut">Date <input type="date" id="qDate" value="${date}"></label>
    ${q.map((i,k)=>`<div class="card ${i.touched?'touched':''}"><button class="tick ${i.touched?'on':''}" data-q="${k}" data-qdone="1" aria-pressed="${!!i.touched}" aria-label="Mark ${esc(i.ex.name)} done">${i.touched?'✓ Done':'Done'}</button><h3>${esc(i.ex.name)}</h3>${i.last?`<button class="ghost lastbtn" data-q="${k}" data-ql="1">↺ Last time ${i.last.date}: ${fmtPlan(i.last,i.ex.unit)}</button>`:'<div class="mut">No previous log</div>'}${qs(k,'sets','Sets',i.sets)}${qs(k,'reps',U(i.ex.unit).reps,i.reps)}${U(i.ex.unit).hasWeight?qs(k,'weight',U(i.ex.unit).weight,i.weight):''}
      <div class="eff">${['Ok','Good','Tough'].map(e=>`<button class="${i.effort===e?'on':''}" data-q="${k}" data-qe="${e}">${e}</button>`).join('')}</div></div>`).join('')}
    <label class="mut" style="display:block">Notes for this block (optional)<textarea id="qNotes" rows="2" style="min-height:64px">${esc(notes[qb]||'')}</textarea></label>
    <div class="row" style="margin:8px 0"><button class="ghost" data-qt="start">⏱ Start rest</button><label class="row" style="flex:2"><input type="checkbox" id="qTimer" ${timerAfter?'checked':''} style="flex:0;width:28px;height:28px"> Timer after save</label></div>
    <div class="help">3 · Finish saves your workout and sets next time's targets.</div>
    <div class="row"><button class="ghost" id="qCancel">Close</button><button class="primary" id="qSave">✓ Finish workout${edited.size>1?' ('+edited.size+' blocks)':''}</button></div>`;
    $('#qNotes').oninput=ev=>{notes[qb]=ev.target.value;if(ev.target.value.trim())edited.add(qb)};};
  draw();dlg.showModal();
  dlg.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();
    date=$('#qDate').value||today();timerAfter=$('#qTimer').checked;
    if(b.id==='qCancel'){dlg.close();dlg.onclick=null;return}
    if(b.dataset.qb){qb=b.dataset.qb;draw();return}
    if(b.dataset.qt==='start'){startTimer();draw();return}
    if(b.dataset.qt==='skip'){stopTimer();draw();return}
    if(b.id==='qSave'){const blocks=edited.size?[...edited]:[qb];let n=0;
      if(Rules.draftSetCount(draft)){complete(true);n++;}
      for(const k of blocks){const T=S.tabs[k];const sess=Rules.buildQuickSession(date,Rules.touchedItems(Q[k]),notes[k]);if(!sess.entries.length)continue;if(deloadTabs.has(k))sess.deload=true;
        const recs=Rules.sessionRecords(T.routine,T.sessions,sess);T.sessions=Rules.addSession(T.sessions,sess);storeRecords(k,date,recs);T.plans.push({date,items:T.routine.filter(Rules.isActive).map(r=>({id:r.id,name:r.name,unit:r.unit,...Rules.nextPlan(r,T.sessions)}))});n++;}
      if(!n)return;save();dlg.close();dlg.onclick=null;draft={};render();toast(n>1?n+' sessions saved':'Session saved');if(timerAfter)startTimer();return}
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
  const fallback=()=>{const dlg=$('#dlg');dlg.onclick=null;dlg.innerHTML=`<h3>Copy session</h3><p class="mut">Clipboard unavailable – select all and copy.</p><textarea id="copyTxt" readonly>${esc(txt)}</textarea><button class="primary" id="copyClose">Close</button>`;
    dlg.showModal();const ta=$('#copyTxt');ta.focus();ta.select();try{document.execCommand('copy')}catch(e){}$('#copyClose').onclick=()=>dlg.close();};
  if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(txt).then(()=>toast('Session copied'),fallback); else fallback(); }
// Weekly report
function reportCard(inline){const r=Rules.weeklyReport(S.tabs,today());
  return `<div class="card report"><h3>📅 Weekly report · ${r.start} → ${r.end}</h3>
    <div class="kpis"><div><b>${r.sessions}</b><small>sessions</small></div><div><b>${r.sets}</b><small>sets</small></div><div><b>${r.volume.toLocaleString()}</b><small>kg volume</small></div><div><b>${r.records.length}</b><small>records</small></div></div>
    ${r.minutes?`<div class="mut">Cardio: ${r.minutes} min</div>`:''}
    <div class="mut">${TABS.filter(([k])=>r.byTab[k]).map(([k,l])=>l+' ×'+r.byTab[k]).join(' · ')||'No sessions yet this week'}</div>
    ${r.records.map(x=>`<div>🏆 ${recTxt(x)}</div>`).join('')}
    ${inline?'<button class="ghost" data-act="repok" style="width:100%;margin-top:8px">Dismiss until next week</button>':''}</div>`;}
function openReport(){const dlg=$('#dlg');dlg.onclick=null;dlg.innerHTML=reportCard(false)+'<button class="primary" id="repClose">Close</button>';dlg.showModal();$('#repClose').onclick=()=>dlg.close();}
// Rest timer
let tEnd=0,tInt=null,actx;
function startTimer(){stopTimer();tEnd=Date.now()+S.restSec*1e3;$('#timer').classList.remove('hidden');document.querySelectorAll('.qtimer').forEach(x=>x.classList.remove('hidden'));tick();tInt=setInterval(tick,250);
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
function tick(){const s=Math.max(0,Math.ceil((tEnd-Date.now())/1e3));$('#timerCount').textContent=s;document.querySelectorAll('.qTimerCount').forEach(x=>x.textContent=s);if(s<=0){stopTimer();buzz()}}
function stopTimer(){clearInterval(tInt);tInt=null;$('#timer').classList.add('hidden');document.querySelectorAll('.qtimer').forEach(x=>x.classList.add('hidden'))}
function buzz(){try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}
  try{if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=660;g.gain.setValueAtTime(0.0001,actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15,actx.currentTime+0.05);g.gain.exponentialRampToValueAtTime(0.0001,actx.currentTime+0.6);o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+0.65)}catch(e){}}
$('#skipBtn').onclick=stopTimer;
// Import / export / absence dialogs
function openImport(){const dlg=$('#dlg');dlg.onclick=null;dlg.innerHTML=`<h3>Import ${TABS.find(t=>t[0]===cur)[1]} log</h3>
  <p class="mut">Paste JSON ({routine, sessions}) or CSV (date,exercise,set,reps,weight,effort), or pick a .json/.csv file. Replaces this tab's data.</p>
  <input type="file" id="impFile" accept=".json,.csv,application/json,text/csv"><textarea id="impTxt" placeholder="Paste here"></textarea>
  <div class="row" style="margin-top:8px"><button class="ghost" id="impCancel">Cancel</button><button class="primary" id="impGo">Import</button></div><div id="impErr" style="color:var(--bad)"></div>`;
  dlg.showModal();$('#impCancel').onclick=()=>dlg.close();
  $('#impFile').onchange=async ev=>{const f=ev.target.files[0];if(f)$('#impTxt').value=await f.text()};
  $('#impGo').onclick=()=>{try{importText($('#impTxt').value);dlg.close();draft={};render();toast('Imported')}catch(err){$('#impErr').textContent=err.message}};}
function importText(txt){
  const T=S.tabs[cur];txt=txt.trim();if(!txt)throw new Error('Nothing to import');
  if(txt[0]==='{'){const d=JSON.parse(txt);if(!Array.isArray(d.sessions))throw new Error('JSON needs a "sessions" array');
    if(Array.isArray(d.routine)&&d.routine.length)T.routine=d.routine;T.sessions=d.sessions;}
  else{const r=Rules.parseCSV(txt);if(!r.sessions.length)throw new Error('No CSV rows found');
    const routine=Object.entries(r.names).map(([id,name])=>{const all=r.sessions.flatMap(s=>s.entries.filter(e=>e.exerciseId===id).map(e=>e.sets));const last=all[all.length-1];
      return T.routine.find(x=>x.id===id)||{id,name,targetSets:last.length,targetReps:Math.max(...last.map(s=>s.reps)),unit:last.some(s=>s.weight>0)?'kg':'bodyweight'}});
    T.routine=routine;T.sessions=r.sessions;}
  T._example=false;T.plans=[];save();
}
function dl(name,type,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();}
$('#csvBtn').onclick=()=>dl('wills-body-'+today()+'.csv','text/csv',Rules.toCSV(S.tabs));
$('#reportBtn').onclick=()=>openReport();
$('#stats').onclick=()=>{S.statsWindow=S.statsWindow===7?30:S.statsWindow===30?90:7;save();render();};
$('#exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='wills-body-backup-'+today()+'.json';a.click()};
$('#absenceBtn').onclick=()=>{const dlg=$('#dlg');dlg.onclick=null;dlg.innerHTML=`<h3>Log absence</h3><p class="mut">Weeks with a work or holiday absence don't break your streak.</p>
  <input type="date" id="absDate" value="${today()}"><div class="row" style="margin-top:10px"><button data-tag="work">💼 Work</button><button data-tag="holiday">🏖 Holiday</button></div>
  <div class="mut" style="margin-top:8px">${S.absences.slice(-5).map(a=>a.date+' '+a.tag).join('<br>')}</div><button class="ghost" style="width:100%;margin-top:10px" id="absClose">Close</button>`;
  dlg.showModal();$('#absClose').onclick=()=>dlg.close();
  dlg.querySelectorAll('[data-tag]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();S.absences.push({date:$('#absDate').value,tag:b.dataset.tag});save();dlg.close();render()});};
// Theme (default dark, persisted)
const THEME_KEY=KEY+'.theme';
function applyTheme(t){document.documentElement.dataset.theme=t;$('#themeBtn').textContent=t==='light'?'🌙':'☀️';$('#themeBtn').setAttribute('aria-label','Switch to '+(t==='light'?'dark':'light')+' theme');
  document.querySelector('meta[name=theme-color]').content=t==='light'?'#f6f7f9':'#0f1115';}
applyTheme(localStorage.getItem(THEME_KEY)==='light'?'light':'dark');
$('#themeBtn').onclick=()=>{const t=document.documentElement.dataset.theme==='light'?'dark':'light';localStorage.setItem(THEME_KEY,t);applyTheme(t)};
const sl=$('#restSlider');
fetch('manifest.webmanifest').then(r=>r.json()).then(m=>{$('#ver').textContent="Will's Body v"+m.version}).catch(()=>{});
load().then(()=>{document.body.classList.remove('loading');sl.value=S.restSec;$('#restVal').textContent=S.restSec;render()});
sl.oninput=()=>{S.restSec=+sl.value;$('#restVal').textContent=sl.value;save();if(tInt){/*keep running*/}};
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
