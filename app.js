'use strict';
const KEY='willsBody.v1', TABS=[['arms','Arms'],['chest-back','Chest & Back'],['shoulders','Shoulders'],['bodyweight','Bodyweight']];
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
  // Seed-version migration: replace seeded sessions with newer seed, keep phone-logged sessions
  for(const [k] of TABS){const t=S.tabs[k];if(!t)continue;
    try{const d=await (await fetch('data/'+k+'.json',{cache:'no-cache'})).json();
      if((d.seedVersion||1)>(t.seedVersion||1)&&!d._example){S.tabs[k]=Rules.mergeSeed(t,d);save();}}catch(e){}}
  // Upgrade untouched example tabs to real seed data without wiping user logs
  for(const [k] of TABS){const t=S.tabs[k];if(!t||!t._example||t.sessions.length)continue;
    try{const d=await (await fetch('data/'+k+'.json',{cache:'no-cache'})).json();
      if(!d._example){S.tabs[k]={_example:false,routine:d.routine||[],sessions:d.sessions||[],plans:[],dismissed:t.dismissed||[],seedVersion:d.seedVersion||1,seedDates:(d.sessions||[]).map(s=>s.date)};save();}}catch(e){}}
}
const unitLbl=u=>u==='kg'?'kg':u==='m'?'m':u==='min'?'min':'';
function fmtSets(sets,u){return sets.map(x=>`<span class="chip">${x.reps}${u==='kg'?' × '+x.weight+'kg':u==='min'||u==='m'?' '+unitLbl(u):''} ${x.effort?' · '+x.effort:''}</span>`).join('')}
function render(){
  const T=S.tabs[cur], allDates=Object.values(S.tabs).flatMap(t=>t.sessions.map(s=>s.date));
  $('#streak').textContent='🔥 '+Rules.weeklyStreak(allDates,S.absences,today())+' wk streak';
  $('#tabs').innerHTML=TABS.map(([k,l])=>`<button role="tab" aria-selected="${k===cur}" data-tab="${k}">${l}</button>`).join('');
  let h='';
  if(T._example) h+=`<div class="banner"><span>Example routine – import your log</span><button data-act="import">Import</button></div>`;
  h+=`<button class="primary" data-act="quick" style="margin:8px 0">⚡ Log whole session</button>`;
  for(const c of Rules.plateauCards(cur,T.routine,T.sessions,T.dismissed))
    h+=`<div class="card sugg"><h3>🔁 Time to change this exercise</h3><div class="mut">${esc(c.reason)}</div>${c.alternatives.map(x=>`<div class="row" style="margin-top:8px"><span>${esc(x.name)}${x.source==='library'?'':' <span class=mut>(alt)</span>'}</span><button data-act="swap" data-from="${c.exerciseId}" data-n="${esc(x.name)}">Swap in</button><button class="ghost" data-act="dismiss" data-n="${esc(x.name)}" aria-label="Dismiss">✕</button></div>`).join('')}</div>`;
  const stalledIds=new Set(Rules.plateauCards(cur,T.routine,T.sessions,T.dismissed).map(c=>c.exerciseId));
  for(const s of Rules.suggestions(cur,T.routine,T.sessions,T.dismissed).filter(s=>!stalledIds.has(s.exerciseId)))
    h+=`<div class="card sugg"><h3>💡 Try ${esc(s.exercise)}</h3><div class="mut">${esc(s.reason)}</div><div class="row" style="margin-top:8px">
      <button data-act="up" data-n="${esc(s.exercise)}" data-from="${s.exerciseId}">👍 ${Rules.activeSlots(T.routine)>=Rules.MAX_ACTIVE?'Swap in':'Add'}</button><button data-act="dismiss" data-n="${esc(s.exercise)}">✕ Dismiss</button></div></div>`;
  const snap=T.plans[T.plans.length-1];
  if(snap) h+=`<div class="card"><h3>Saved plan for next session</h3><div class="mut">Snapshot from ${snap.date}</div>${snap.items.map(i=>`<div>${esc(i.name)}: <span class="plan">${i.sets}×${i.reps}${i.unit==='kg'?' @ '+i.weight+'kg':''}</span></div>`).join('')}</div>`;
  for(const ex of T.routine.filter(Rules.isActive)){
    const hist=Rules.history(ex.id,T.sessions), last=hist[hist.length-1], plan=Rules.nextPlan(ex,T.sessions);
    const d=draft[ex.id]||(draft[ex.id]={sets:[],reps:plan.reps,weight:plan.weight,effort:'Good',targetSets:plan.sets});
    const flags=Rules.detectPlateaus(ex,T.sessions);
    h+=`<div class="card"><h3>${esc(ex.name)}</h3><div class="mut">Routine: ${ex.targetSets} × ${ex.targetReps} ${unitLbl(ex.unit)}</div>
      <div class="mut">Last: ${last?last.date+'</div><div class="sets">'+fmtSets(last.sets,ex.unit):'none yet'}</div>
      <div><button class="ghost" style="float:right;min-height:40px" data-act="toggle" data-ex="${ex.id}" aria-label="Deactivate">✕</button>Next: <span class="plan">${plan.sets}×${plan.reps}${ex.unit==='kg'?' @ '+plan.weight+'kg':''}</span> <span class="mut">${esc(plan.note)}</span></div>
      ${flags.map(f=>`<div style="color:var(--warn)">⚠ ${esc(f.reason)}</div>`).join('')}
      ${stepper(ex.id,'targetSets','Sets',d.targetSets)}${stepper(ex.id,'reps',ex.unit==='min'?'Minutes':ex.unit==='m'?'Metres':'Reps',d.reps)}
      ${ex.unit==='kg'?stepper(ex.id,'weight','Weight kg',d.weight):''}
      <div class="eff">${['Ok','Good','Tough'].map(e=>`<button class="${d.effort===e?'on':''}" data-act="eff" data-ex="${ex.id}" data-v="${e}">${e}</button>`).join('')}</div>
      <button class="primary" data-act="log" data-ex="${ex.id}">Log set ${Math.min(d.sets.length+1,99)} of ${d.targetSets}</button>
      <div class="sets">${fmtSets(d.sets,ex.unit)}${d.sets.length?`<button data-act="undo" data-ex="${ex.id}">Undo</button>`:''}</div></div>`;
  }
  const inactive=T.routine.filter(r=>!Rules.isActive(r));
  if(inactive.length) h+=`<details class="card"><summary>Inactive / optional (${inactive.length}) – max 4 active</summary>${inactive.map(r=>`<div class="row" style="margin-top:6px"><span>${esc(r.name)}</span><button class="ghost" data-act="toggle" data-ex="${r.id}">Activate</button></div>`).join('')}</details>`;
  const any=T.routine.some(r=>draft[r.id]&&draft[r.id].sets.length);
  h+=`<button class="primary" data-act="complete" ${any?'':'disabled style="opacity:.4"'}>✅ Session complete</button>
    <div class="row" style="margin:12px 0"><button class="ghost" data-act="import">Import log</button></div>`;
  $('#main').innerHTML=h;
}
function stepper(id,f,label,v){return `<div class="step"><button data-act="dec" data-ex="${id}" data-f="${f}" aria-label="less ${label}">−</button><div class="v">${v}<small>${label}</small></div><button data-act="inc" data-ex="${id}" data-f="${f}" aria-label="more ${label}">+</button></div>`}
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return; const T=S.tabs[cur];
  if(b.dataset.tab){cur=b.dataset.tab;localStorage.setItem(KEY+'.tab',cur);render();scrollTo(0,0);return}
  const a=b.dataset.act, d=draft[b.dataset.ex], ex=T.routine.find(r=>r.id===b.dataset.ex);
  if(a==='inc'||a==='dec'){const f=b.dataset.f, st=f==='weight'?2.5:1, sg=a==='inc'?1:-1;d[f]=Math.max(f==='weight'?0:1,Math.round((d[f]+sg*st)*10)/10);}
  else if(a==='eff') d.effort=b.dataset.v;
  else if(a==='log'){d.sets.push({reps:d.reps,weight:ex.unit==='kg'?d.weight:0,effort:d.effort});startTimer();}
  else if(a==='undo') d.sets.pop();
  else if(a==='up'){const n=b.dataset.n;T.routine=Rules.acceptSuggestion(T.routine,{exerciseId:b.dataset.from},{id:'ex-'+Rules.slug(n),name:n,targetSets:3,targetReps:cur==='bodyweight'?12:10,unit:cur==='bodyweight'?'bodyweight':'kg'});save();}
  else if(a==='swap'){T.routine=Rules.swapExercise(T.routine,b.dataset.from,{name:b.dataset.n});delete draft[b.dataset.from];save();toast('Swapped in '+b.dataset.n);}
  else if(a==='quick'){openQuick();return}
  else if(a==='toggle'){const r=T.routine.find(r=>r.id===b.dataset.ex);if(r.active===false){if(Rules.activeSlots(T.routine)>=Rules.MAX_ACTIVE){toast('Max 4 exercises – deactivate one first');return}r.active=true;}else r.active=false;save();}
  else if(a==='dismiss'){T.dismissed.push(b.dataset.n);save();}
  else if(a==='complete') complete();
  else if(a==='import') openImport();
  else return; render();
});
function complete(){
  const T=S.tabs[cur], entries=T.routine.filter(r=>draft[r.id]&&draft[r.id].sets.length).map(r=>({exerciseId:r.id,sets:draft[r.id].sets}));
  if(!entries.length) return;
  const date=today(), ex=T.sessions.find(s=>s.date===date);
  if(ex){for(const en of entries){const o=ex.entries.find(x=>x.exerciseId===en.exerciseId);o?o.sets.push(...en.sets):ex.entries.push(en)}} else T.sessions.push({date,entries,local:true});
  T.plans.push({date,items:T.routine.filter(Rules.isActive).map(r=>({id:r.id,name:r.name,unit:r.unit,...Rules.nextPlan(r,T.sessions)}))});
  draft={}; save(); stopTimer(); toast('Session saved – next plan snapshotted');
}
function toast(m){const t=document.createElement('div');t.textContent=m;t.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#14532d;padding:12px 18px;border-radius:12px;z-index:20;font-weight:700';document.body.append(t);setTimeout(()=>t.remove(),2500)}
// Quick log sheet
function openQuick(){
  const T=S.tabs[cur], exs=T.routine.filter(Rules.isActive), dlg=$('#dlg');
  const q=exs.map(ex=>{const p=Rules.nextPlan(ex,T.sessions);return {ex,exerciseId:ex.id,sets:p.sets,reps:p.reps,weight:ex.unit==='kg'?p.weight:0,effort:'Good'}});
  const draw=()=>{dlg.innerHTML=`<h3>Log whole session – ${TABS.find(t=>t[0]===cur)[1]}</h3>
    <label class="mut">Date <input type="date" id="qDate" value="${dlg.dataset.date||today()}"></label>
    ${q.map((i,k)=>`<div class="card"><h3>${esc(i.ex.name)}</h3>${qs(k,'sets','Sets',i.sets)}${qs(k,'reps',i.ex.unit==='min'?'Minutes':i.ex.unit==='m'?'Metres':'Reps',i.reps)}${i.ex.unit==='kg'?qs(k,'weight','Weight kg',i.weight):''}
      <div class="eff">${['Ok','Good','Tough'].map(e=>`<button class="${i.effort===e?'on':''}" data-q="${k}" data-qe="${e}">${e}</button>`).join('')}</div></div>`).join('')}
    <label class="row" style="margin:8px 0"><input type="checkbox" id="qTimer" ${dlg.dataset.timer==='1'?'checked':''} style="flex:0;width:28px;height:28px"> Start rest timer after saving</label>
    <div class="row"><button class="ghost" id="qCancel">Cancel</button><button class="primary" id="qSave">Save session</button></div>`;};
  const qs=(k,f,l,v)=>`<div class="step"><button data-q="${k}" data-qf="${f}" data-qd="-1">−</button><div class="v">${v}<small>${l}</small></div><button data-q="${k}" data-qf="${f}" data-qd="1">+</button></div>`;
  dlg.dataset.date='';dlg.dataset.timer='0';draw();dlg.showModal();
  dlg.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();
    dlg.dataset.date=$('#qDate').value;dlg.dataset.timer=$('#qTimer').checked?'1':'0';
    if(b.id==='qCancel'){dlg.close();return}
    if(b.id==='qSave'){const sess=Rules.buildQuickSession(dlg.dataset.date||today(),q);if(!sess.entries.length)return;
      T.sessions=Rules.addSession(T.sessions,sess);T.plans.push({date:sess.date,items:T.routine.filter(Rules.isActive).map(r=>({id:r.id,name:r.name,unit:r.unit,...Rules.nextPlan(r,T.sessions)}))});
      save();dlg.close();dlg.onclick=null;draft={};render();toast('Session saved');if(dlg.dataset.timer==='1')startTimer();return}
    const i=q[+b.dataset.q];if(b.dataset.qe)i.effort=b.dataset.qe;
    else if(b.dataset.qf){const f=b.dataset.qf,st=f==='weight'?2.5:1;i[f]=Math.max(f==='reps'?1:0,Math.round((i[f]+(+b.dataset.qd)*st)*10)/10);}
    draw();};
}
// Rest timer
let tEnd=0,tInt=null,actx;
function startTimer(){stopTimer();tEnd=Date.now()+S.restSec*1e3;$('#timer').classList.remove('hidden');tick();tInt=setInterval(tick,250);
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
function tick(){const s=Math.max(0,Math.ceil((tEnd-Date.now())/1e3));$('#timerCount').textContent=s;if(s<=0){stopTimer();buzz()}}
function stopTimer(){clearInterval(tInt);tInt=null;$('#timer').classList.add('hidden')}
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
$('#exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='wills-body-backup-'+today()+'.json';a.click()};
$('#absenceBtn').onclick=()=>{const dlg=$('#dlg');dlg.onclick=null;dlg.innerHTML=`<h3>Log absence</h3><p class="mut">Weeks with a work or holiday absence don't break your streak.</p>
  <input type="date" id="absDate" value="${today()}"><div class="row" style="margin-top:10px"><button data-tag="work">💼 Work</button><button data-tag="holiday">🏖 Holiday</button></div>
  <div class="mut" style="margin-top:8px">${S.absences.slice(-5).map(a=>a.date+' '+a.tag).join('<br>')}</div><button class="ghost" style="width:100%;margin-top:10px" id="absClose">Close</button>`;
  dlg.showModal();$('#absClose').onclick=()=>dlg.close();
  dlg.querySelectorAll('[data-tag]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();S.absences.push({date:$('#absDate').value,tag:b.dataset.tag});save();dlg.close();render()});};
const sl=$('#restSlider');
load().then(()=>{sl.value=S.restSec;$('#restVal').textContent=S.restSec;render()});
sl.oninput=()=>{S.restSec=+sl.value;$('#restVal').textContent=sl.value;save();if(tInt){/*keep running*/}};
if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
