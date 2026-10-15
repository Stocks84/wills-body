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
  if(!last) return {sets:ex.targetSets, reps:ex.targetReps, weight:0, action:'start', note:'No sessions yet – pick a starting weight'};
  const kg=ex.unit==='kg', base={sets:ex.targetSets, reps:ex.targetReps, weight:last.weight};
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
function suggestions(tab, routine, sessions, dismissed){
  const flags=routine.flatMap(ex=>detectPlateaus(ex,sessions)); if(!flags.length) return [];
  const have=new Set(routine.map(r=>slug(r.name))); const pool=(LIBRARY[tab]||[]).filter(n=>!have.has(slug(n))&&!(dismissed||[]).includes(n));
  return flags.map((f,i)=>pool[i]?{...f, exercise:pool[i]}:null).filter(Boolean);
}
const api={history,nextPlan,detectPlateaus,isoWeek,weeklyStreak,parseCSV,suggestions,LIBRARY,slug};
if(typeof module!=='undefined') module.exports=api; else root.Rules=api;
})(this);
