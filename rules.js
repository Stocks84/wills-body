// Pure rules: progression, plateau detection, streaks, CSV parsing. Works in browser (window.Rules) and Node (module.exports).
(function(root){
const round = (x, step) => Math.round(x / step) * step;
function history(exId, sessions){ // chronological summaries for one exercise
  return [...sessions].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0)
    .map(s=>{const e=(s.entries||[]).find(e=>e.exerciseId===exId); if(!e||!e.sets||!e.sets.length) return null;
      const w=Math.max(...e.sets.map(x=>+x.weight||0)), reps=e.sets.reduce((a,x)=>a+(+x.reps||0),0);
      return {date:s.date, sets:e.sets, weight:w, totalReps:reps, avgReps:reps/e.sets.length,
        allOk:e.sets.every(x=>x.effort==='Ok'), tough:e.sets.some(x=>x.effort==='Tough')};}).filter(Boolean);
}
function hitTarget(h, ex){ return h.sets.length>=ex.targetSets && h.sets.every(x=>(+x.reps||0)>=ex.targetReps); }
function nextPlan(ex, sessions){
  const h=history(ex.id, sessions), last=h[h.length-1];
  if(!last) return {sets:ex.targetSets, reps:ex.repMin||ex.targetReps, weight:ex.targetWeight||0, action:'start', note:'No sessions yet – pick a starting weight'};
  const kg=ex.unit==='kg', base={sets:ex.targetSets, reps:ex.targetReps, weight:last.weight};
  if(ex.noAutoProgress) return {...base, reps:ex.targetReps, action:'repeat', note:'Tracked only – no auto progression'};
  if(ex.repMax){ // rep-range rule: top of range with Good effort -> add weight; otherwise hold weight, add reps
    const minR=Math.min(...last.sets.map(x=>+x.reps||0));
    if(kg && minR>=ex.repMax && last.sets.every(x=>x.effort==='Good')) return {...base, reps:ex.repMin||ex.repMax, weight:ex.assist?Math.max(0,round(last.weight-(ex.weightStep||2.5),0.5)):round(last.weight+(ex.weightStep||2.5),0.5), action:'increase', note:ex.assist?'Top of range with Good effort – reduce assist':'Top of range with Good effort – add weight'};
    return {...base, reps:Math.min(ex.repMax,minR+1), action:'repeat', note:'Hold weight, add reps'};
  }
  if(hitTarget(last,ex) && !last.tough){
    if(kg) return {...base, weight:round(last.weight+2.5,0.5), action:'increase', note:'All reps hit – add 2.5 kg'};
    const maxReps=Math.max(...last.sets.map(x=>+x.reps||0));
    return {...base, reps:Math.max(ex.targetReps,maxReps)+1, action:'increase', note:'All reps hit – add 1 rep'};
  }
  if(last.tough && hitTarget(last,ex)) return {...base, action:'repeat', note:'Felt tough – repeat to consolidate'};
  let misses=0; for(let i=h.length-1;i>=0 && !hitTarget(h[i],ex);i--) misses++;
  if(misses>=2 && kg && last.weight>0) return {...base, weight:round(last.weight*0.95,0.5), action:'deload', note:'Missed reps twice – deload 5%'};
  return {...base, action:'repeat', note:'Missed reps – repeat this weight'};
}
function detectPlateaus(ex, sessions){
  const h=history(ex.id, sessions), out=[], n=h.length;
  if(n>=2){const a=h[n-2], b=h[n-1]; if(b.weight>a.weight && b.avgReps<a.avgReps) out.push({type:'reps-drop', exerciseId:ex.id, reason:`${ex.name}: reps dropped after the weight jump to ${b.weight}`});}
  if(n>=3){const l=h.slice(-3);
    if(l.every(x=>x.weight===l[0].weight && x.totalReps===l[0].totalReps)) out.push({type:'stuck', exerciseId:ex.id, reason:`${ex.name}: same weight and reps for 3 sessions`});
    if(l.every(x=>x.allOk)) out.push({type:'too-easy', exerciseId:ex.id, reason:`${ex.name}: effort "Ok" 3 sessions running – time to nudge it up`});}
  return out;
}
function isoWeek(dateStr){ const d=new Date(dateStr+'T00:00:00Z'); const day=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-day+3);
  const y=d.getUTCFullYear(), w1=new Date(Date.UTC(y,0,4)); const wk=1+Math.round(((d-w1)/864e5-3+((w1.getUTCDay()+6)%7))/7);
  return y+'-W'+String(wk).padStart(2,'0'); }
function weeklyStreak(sessionDates, absences, today){
  const done=new Set(sessionDates.map(isoWeek)), away=new Set((absences||[]).filter(a=>a.tag==='work'||a.tag==='holiday').map(a=>isoWeek(a.date)));
  let streak=0; const d=new Date(today+'T00:00:00Z');
  for(let i=0;i<520;i++){ const wk=isoWeek(d.toISOString().slice(0,10));
    if(done.has(wk)) streak++; else if(away.has(wk)||i===0){} else break;
    d.setUTCDate(d.getUTCDate()-7);}
  return streak;
}
const slug=s=>String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function parseCSV(text){ // date,exercise,set,reps,weight,effort
  const lines=text.trim().split(/\r?\n/).filter(Boolean); if(/^date\s*,/i.test(lines[0])) lines.shift();
  const byDate={}, names={};
  for(const ln of lines){ const [date,exercise,set,reps,weight,effort]=ln.split(',').map(s=>s.trim());
    if(!date||!exercise) continue; const id='ex-'+slug(exercise); names[id]=exercise;
    const s=byDate[date]||(byDate[date]={date,entries:[]}); let e=s.entries.find(e=>e.exerciseId===id); if(!e) s.entries.push(e={exerciseId:id,sets:[]});
    const ef=(effort||'Good'); e.sets.push({reps:+reps||0, weight:+weight||0, effort:['Ok','Good','Tough'].includes(ef)?ef:'Good'});}
  return {sessions:Object.values(byDate).sort((a,b)=>a.date<b.date?-1:1), names};
}
const LIBRARY={arms:['Incline dumbbell curls','Cable rope pushdowns','Wrist curls'],'chest-back':['Machine chest fly','Single-arm dumbbell row','Lat pulldown'],
  shoulders:['Arnold press','Cable lateral raises','Rear delt flyes'],bodyweight:['Diamond push-ups','Bulgarian split squats','Towel rows']};
const MAX_ACTIVE=4;
const isActive=r=>r.active!==false;
function activeSlots(routine){ return new Set(routine.filter(isActive).map(r=>r.group||r.id)).size; }
// Accept a library suggestion without exceeding MAX_ACTIVE: add, or swap out the flagged exercise (its whole group).
function acceptSuggestion(routine, sugg, newEx){
  const out=routine.map(r=>({...r})), have=out.find(r=>slug(r.name)===slug(newEx.name));
  if(have&&isActive(have)) return out;
  if(activeSlots(out)>=MAX_ACTIVE){ const f=out.find(r=>r.id===sugg.exerciseId&&isActive(r)) || out.filter(isActive).slice(-1)[0];
    const g=f.group||f.id; out.forEach(r=>{if((r.group||r.id)===g) r.active=false}); newEx={...newEx, replaces:f.id}; }
  if(have){ Object.assign(have,{active:true}); if(newEx.replaces) have.replaces=newEx.replaces; } else out.push({...newEx});
  return out;
}
function suggestions(tab, routine, sessions, dismissed){
  routine=routine.filter(isActive);
  const flags=routine.flatMap(ex=>detectPlateaus(ex,sessions)); if(!flags.length) return [];
  const have=new Set(routine.map(r=>slug(r.name))); const pool=(LIBRARY[tab]||[]).filter(n=>!have.has(slug(n))&&!(dismissed||[]).includes(n));
  const used=new Set(), byId=Object.fromEntries(routine.map(r=>[r.id,r]));
  return flags.map(f=>{const m=muscleOf((byId[f.exerciseId]||{}).name), pick=pool.find(n=>!used.has(n)&&LIB_MUSCLE[n]===m);
    if(!pick) return null; used.add(pick); return {...f, exercise:pick};}).filter(Boolean);
}
// Seed migration: take the new seed's sessions, keep any phone-logged sessions (local:true or dates not in the seed).
function mergeSeed(stored, seed){
  const seedDates=new Set((seed.sessions||[]).map(s=>s.date)), oldSeed=new Set(stored.seedDates||[]);
  const local=(stored.sessions||[]).filter(s=>s.local || (!seedDates.has(s.date) && !oldSeed.has(s.date)));
  // keep phone-added notes on seeded dates
  const phoneNotes=Object.fromEntries((stored.sessions||[]).filter(s=>s.notesLocal&&!s.local).map(s=>[s.date,s.notes]));
  const seeded=(seed.sessions||[]).map(s=>phoneNotes[s.date]!==undefined?{...s,notes:phoneNotes[s.date],notesLocal:true}:s);
  const localDates=new Set(local.map(s=>s.date));
  const sessions=[...seeded.filter(s=>!localDates.has(s.date)), ...local].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  let routine=(seed.routine||[]).map(r=>({...r}));
  for(const r of stored.routine||[]) if(!routine.some(x=>x.id===r.id)) routine.push({...r, active: activeSlots(routine)<MAX_ACTIVE && isActive(r) ? r.active : false});
  return {...stored, _example:!!seed._example, routine, sessions, seedVersion:seed.seedVersion||1, seedDates:[...seedDates]};
}
// Stall rule: last 3+ consecutive logged sessions of an exercise where neither top weight nor total reps
// went up from one session to the next (each session <= previous on both).
function isStalled(ex, sessions, n=3){
  const h=history(ex.id,sessions); if(h.length<n) return false; const l=h.slice(-n);
  for(let i=1;i<l.length;i++) if(l[i].weight>l[i-1].weight || l[i].totalReps>l[i-1].totalReps) return false;
  return true;
}
const LIB_MUSCLE={'Incline dumbbell curls':'biceps','Cable rope pushdowns':'triceps','Wrist curls':'forearms','Machine chest fly':'chest',
  'Single-arm dumbbell row':'back','Lat pulldown':'back','Arnold press':'delts-front','Cable lateral raises':'delts-side','Rear delt flyes':'delts-rear',
  'Diamond push-ups':'chest','Bulgarian split squats':'legs','Towel rows':'back'};
const FALLBACK={biceps:['Cable curls','Concentration curls'],triceps:['Overhead cable extension','Close-grip push-ups'],forearms:['Reverse cable curls','Farmer carries'],
  chest:['Incline dumbbell press','Cable crossover'],back:['Seated cable row','Chest-supported row'],'delts-front':['Machine shoulder press','Landmine press'],
  'delts-side':['Machine lateral raise','Lean-away lateral raise'],'delts-rear':['Reverse pec deck','Band pull-aparts'],legs:['Goblet squats','Step-ups'],
  core:['Plank','Dead bug'],cardio:['Bike intervals','Incline treadmill walk']};
function muscleOf(name){ const n=String(name).toLowerCase();
  if(/rowing|stepmaster|row time|row distance/.test(n)) return 'cardio';
  if(/wrist|reverse/.test(n)) return 'forearms';
  if(/skull|tricep|pushdown|tricep dips/.test(n)) return 'triceps';
  if(/curl/.test(n)) return 'biceps';
  if(/face pull|rear delt/.test(n)) return 'delts-rear';
  if(/lateral/.test(n)) return 'delts-side';
  if(/shoulder press|arnold|front raise/.test(n)) return 'delts-front';
  if(/bench|chest|pec|fly|push-up|dips/.test(n)) return 'chest';
  if(/row|pull/.test(n)) return 'back';
  if(/squat|leg|calf|lunge|abductor/.test(n)) return 'legs';
  if(/abs|plank|core|back strength/.test(n)) return 'core';
  return null; }
function alternatives(tab, ex, routine, dismissed, max=3){
  const m=muscleOf(ex.name); if(!m) return [];
  const taken=new Set(routine.filter(isActive).map(r=>slug(r.name))), skip=new Set((dismissed||[]).map(slug));
  const ok=n=>!taken.has(slug(n))&&!skip.has(slug(n))&&slug(n)!==slug(ex.name);
  const lib=(LIBRARY[tab]||[]).filter(n=>LIB_MUSCLE[n]===m&&ok(n)).map(name=>({name,source:'library'}));
  const fb=lib.length?[]:(FALLBACK[m]||[]).filter(ok).map(name=>({name,source:'alternative'}));
  return [...lib,...fb].slice(0,max);
}
function plateauCards(tab, routine, sessions, dismissed){
  return routine.filter(isActive).filter(ex=>!ex.noAutoProgress&&isStalled(ex,sessions))
    .map(ex=>({exerciseId:ex.id,name:ex.name,reason:`${ex.name}: no increase in weight or total reps for 3 sessions`,alternatives:alternatives(tab,ex,routine,dismissed)}))
    .filter(c=>c.alternatives.length);
}
// Always replace (keeps cap): old exercise (and its group) goes inactive, new one takes its slot.
function swapExercise(routine, oldId, newEx){
  const out=routine.map(r=>({...r})), old=out.find(r=>r.id===oldId); if(!old) return out;
  const g=old.group||old.id; out.forEach(r=>{if((r.group||r.id)===g) r.active=false});
  const have=out.find(r=>slug(r.name)===slug(newEx.name));
  const tmpl={targetSets:old.targetSets,targetReps:old.repMax||old.targetReps,repMin:old.repMin,repMax:old.repMax,unit:old.unit==='m'||old.unit==='min'?old.unit:old.unit};
  if(have) Object.assign(have,{active:true,replaces:oldId}); else out.push({id:'ex-'+slug(newEx.name),name:newEx.name,...tmpl,replaces:oldId});
  return out;
}
// Quick log: items [{exerciseId, sets, reps, weight, effort}] -> session
function buildQuickSession(date, items, notes){
  const out={date, local:true, entries:items.filter(i=>i.sets>0).map(i=>({exerciseId:i.exerciseId,
    sets:Array.from({length:i.sets},()=>({reps:i.reps,weight:i.weight||0,effort:i.effort||'Good'}))}))};
  if(notes&&String(notes).trim()) { out.notes=String(notes).trim(); out.notesLocal=true; }
  return out;
}
// Trend series for sparklines: kg -> weight + reps; bodyweight -> reps; min -> minutes; m -> metres
function trendSeries(ex, sessions){
  const h=history(ex.id,sessions), dates=h.map(x=>x.date);
  if(ex.unit==='kg') return {dates, series:[{label:'Top weight (kg)',values:h.map(x=>x.weight)},{label:'Total reps',values:h.map(x=>x.totalReps)}]};
  const label=ex.unit==='min'?'Minutes':ex.unit==='m'?'Metres':'Total reps';
  return {dates, series:[{label,values:h.map(x=>x.totalReps)}]};
}
function sparkPoints(values, w=280, h=48, pad=4){
  if(!values.length) return '';
  const mn=Math.min(...values), mx=Math.max(...values), rng=mx-mn||1, n=values.length;
  return values.map((v,i)=>`${(n===1?w/2:pad+i*(w-2*pad)/(n-1)).toFixed(1)},${(h-pad-(v-mn)*(h-2*pad)/rng).toFixed(1)}`).join(' ');
}
function addSession(sessions, sess){
  const out=sessions.map(s=>({...s,entries:s.entries.map(e=>({...e,sets:[...e.sets]}))})), ex=out.find(s=>s.date===sess.date);
  if(ex){ for(const en of sess.entries){const o=ex.entries.find(x=>x.exerciseId===en.exerciseId); o?o.sets.push(...en.sets):ex.entries.push(en)} ex.local=true;
    if(sess.notes){ ex.notes=ex.notes?ex.notes+'\n'+sess.notes:sess.notes; ex.notesLocal=true; } }
  else out.push(sess);
  return out.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
}
const api={history,nextPlan,detectPlateaus,isoWeek,weeklyStreak,parseCSV,suggestions,LIBRARY,slug,MAX_ACTIVE,isActive,activeSlots,acceptSuggestion,mergeSeed,isStalled,muscleOf,alternatives,plateauCards,swapExercise,buildQuickSession,addSession,FALLBACK,LIB_MUSCLE,trendSeries,sparkPoints};
if(typeof module!=='undefined') module.exports=api; else root.Rules=api;
})(this);
