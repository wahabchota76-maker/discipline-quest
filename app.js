const K="DQ_FINAL";
const DEFAULT={xp:0,coins:0,best:0,lastActivity:"",quests:0,workouts:[],qd:{},notes:{},ach:{},shop:{},name:"Discipline Warrior",goal:100,tab:"home"};
let D=(()=>{try{return {...DEFAULT,...JSON.parse(localStorage.getItem(K)||"{}")}}catch{return {...DEFAULT}}})();
const pad=n=>String(n).padStart(2,"0");
const today=()=>{const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const dateFromKey=k=>{const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d)};
const keyOffset=(k,days)=>{const d=dateFromKey(k);d.setDate(d.getDate()+days);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const level=()=>Math.floor(D.xp/500)+1;
const xpInLevel=()=>D.xp%500;
const save=()=>localStorage.setItem(K,JSON.stringify(D));
function toast(s){const x=document.createElement("div");x.className="toast";x.textContent=s;document.body.append(x);setTimeout(()=>x.remove(),1600)}
function activeDay(k){return (D.qd[k]||[]).length>0}
function currentStreak(){
  let k=today(), n=0;
  while(activeDay(k)){n++;k=keyOffset(k,-1)}
  return n;
}
function bestStreak(){
  const days=Object.keys(D.qd).filter(activeDay).sort();
  let best=0,run=0,prev="";
  for(const k of days){run=(prev&&keyOffset(prev,1)===k)?run+1:1;best=Math.max(best,run);prev=k}
  return Math.max(best,D.best||0);
}
function syncStats(){D.best=bestStreak();D.lastActivity=Object.keys(D.qd).filter(activeDay).sort().at(-1)||"";save()}
const Q=[
 ["workout","💪","Complete a workout",60],
 ["strength","⚡","Strength practice",25],
 ["focus","🎯","Deep focus",35],
 ["move","🚶","Move for 10 minutes",25],
 ["recovery","🌙","Recovery check",20],
 ["journal","📝","Journal today",35],
 ["self","🛡️","Self-control check-in",40]
];
const EX=["Push-ups","Pull-ups","Squats","Lunges","Plank","Pike push-ups","Glute bridge","Calf raises"];
const ACH=[
 ["first","🌱","First Quest",()=>D.quests>=1],
 ["s7","🔥","7-Day Streak",()=>currentStreak()>=7],
 ["s30","🏆","30-Day Streak",()=>D.best>=30],
 ["w10","💪","Ten Sessions",()=>D.workouts.length>=10],
 ["xp1","⭐","1K XP",()=>D.xp>=1000],
 ["lv5","🔮","Level 5",()=>level()>=5],
 ["q100","🎯","Quest Master",()=>D.quests>=100]
];
function check(){for(const a of ACH)if(!D.ach[a[0]]&&a[3]()){D.ach[a[0]]=1;D.coins+=25;toast("🏆 "+a[2]+" • +25 coins")}}
function add(xp){D.xp+=xp;D.coins+=Math.max(1,Math.floor(xp/10));check();syncStats();toast("+"+xp+" XP")}
function done(id){return (D.qd[today()]||[]).includes(id)}
function quest(id){
 if(done(id))return toast("Already completed today");
 const q=Q.find(x=>x[0]===id);if(!q)return;
 D.qd[today()]=D.qd[today()]||[];D.qd[today()].push(id);D.quests++;
 add(q[3]);render();
}
function nav(){return `<nav class="nav">${[["⌂","Home","home"],["⚔","Quests","quests"],["💪","Workout","workout"],["📊","Stats","stats"],["🗺","Map","map"],["☰","More","more"]].map(x=>`<button class="${D.tab===x[2]?"active":""}" onclick="go('${x[2]}')"><b>${x[0]}</b>${x[1]}</button>`).join("")}</nav>`}
function head(a,b){return `<div class="top"><div class="row"><div><div class="brand">${a}</div><div class="muted tiny">${b}</div></div><div class="rightstat">LV ${level()}<br>🪙 ${D.coins}</div></div></div>`}
function hero(){const p=xpInLevel()/5,st=currentStreak();return `<div class="card hero"><div class="row"><div><div class="label">LEVEL</div><div class="level">${level()}</div></div><b>🔥 ${st} day${st===1?"":"s"}</b></div><div class="xp"><i style="width:${p}%"></i></div><div class="row tiny muted"><span>${xpInLevel()}/500 XP</span><span>${500-xpInLevel()} to next</span></div></div>`}
function qc(q){const d=done(q[0]);return `<div class="card quest"><div class="qicon">${q[1]}</div><div class="grow"><b>${q[2]}</b><div class="reward">+${q[3]} XP</div></div><button class="btn ${d?"secondary":""}" onclick="quest('${q[0]}')">${d?"✓":"GO"}</button></div>`}
function home(){const total=(D.qd[today()]||[]).reduce((s,id)=>s+(Q.find(q=>q[0]===id)?.[3]||0),0);const consistency=Object.keys(D.qd).length?Math.round(Object.keys(D.qd).filter(activeDay).length/Math.max(Object.keys(D.qd).length,1)*100):0;return head("Discipline Quest","Turn real actions into game progress.")+hero()+`<div class="grid2"><div class="stat"><div class="big">🔥 ${currentStreak()}</div><div class="label">CURRENT STREAK</div></div><div class="stat"><div class="big">${consistency}%</div><div class="label">ACTIVE DAYS</div></div></div><div class="section">TODAY</div>${Q.slice(0,4).map(qc).join("")}<div class="card"><b>🎯 Daily XP Goal</b><div class="muted tiny">${total}/${D.goal} XP from today's quests</div></div>`}
function weekWorkouts(){const end=dateFromKey(today()),start=new Date(end);start.setDate(start.getDate()-6);return D.workouts.filter(x=>{const d=dateFromKey(x.date);return d>=start&&d<=end}).length}
function quests(){const w=weekWorkouts(),p=Math.min(100,w/4*100);return head("Quests","Daily missions and the weekly boss.")+`<div class="section">DAILY MISSIONS</div>${Q.map(qc).join("")}<div class="section">WEEKLY BOSS</div><div class="card hero"><div class="row"><div><b>🐉 The Lazy Beast</b><br><small class="muted">4 workouts in the last 7 days</small></div><b>${w}/4</b></div><div class="bar"><i style="width:${p}%"></i></div>${p>=100&&!D.shop.bossClaimed?'<button class="btn" style="margin-top:12px" onclick="boss()">Claim 250 XP</button>':p>=100?'<div class="reward" style="margin-top:12px">✓ Boss reward claimed</div>':""}</div>`}
function boss(){if(D.shop.bossClaimed)return toast("Already claimed");D.shop.bossClaimed=true;add(250);render()}
function workout(){return head("Workout","Log sessions and track personal bests.")+`<div class="card"><div class="field"><label>Exercise</label><select id="ex">${EX.map(x=>`<option>${x}</option>`).join("")}</select></div><div class="grid2" style="margin:0"><div class="field"><label>Sets</label><input id="sets" type="number" value="3" min="1" max="50"></div><div class="field"><label>Reps / sec</label><input id="reps" type="number" value="10" min="1" max="1000"></div></div><button class="btn" onclick="log()">Log workout</button></div><div class="section">RECENT</div><div class="card">${D.workouts.slice(-10).reverse().map(w=>`<div class="achievement"><span class="badge">💪</span><div><b>${esc(w.ex)}</b><br><small>${w.sets} × ${w.reps} • ${w.date}</small></div>${w.pr?"<span>🏆 PR</span>":""}</div>`).join("")||'<div class="muted">No sessions yet.</div>'}</div>`}
function log(){const ex=document.getElementById("ex").value,s=+document.getElementById("sets").value,r=+document.getElementById("reps").value;if(!Number.isFinite(s)||!Number.isFinite(r)||s<1||r<1)return toast("Enter valid sets and reps");const old=Math.max(0,...D.workouts.filter(w=>w.ex===ex).map(w=>w.reps));const pr=r>old;D.workouts.push({date:today(),ex,sets:s,reps:r,pr});if(!done("workout")){D.qd[today()]=D.qd[today()]||[];D.qd[today()].push("workout");D.quests++}add(pr?90:60);render()}
function stats(){let cells="",d=new Date();d.setDate(1);const m=d.getMonth(),st=d.getDay();for(let i=0;i<st;i++)cells+="<div></div>";while(d.getMonth()===m){const k=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,g=activeDay(k);cells+=`<div class="day ${g?"good":""} ${k===today()?"today":""}">${d.getDate()}</div>`;d.setDate(d.getDate()+1)}return head("Stats","Measure consistency, not perfection.")+`<div class="grid2"><div class="stat"><div class="big">${D.xp}</div><div class="label">XP</div></div><div class="stat"><div class="big">${D.workouts.length}</div><div class="label">WORKOUTS</div></div><div class="stat"><div class="big">${D.best}</div><div class="label">BEST STREAK</div></div><div class="stat"><div class="big">${D.quests}</div><div class="label">QUESTS</div></div></div><div class="section">THIS MONTH</div><div class="card"><div class="calendar">${cells}</div></div>`}
function map(){const z=[["Village of Beginnings",1],["Focus Forest",4],["Strength Mountain",8],["Discipline Castle",12],["Mastery Realm",20]];return head("Progress Map","Unlock zones as your level grows.")+'<div class="card">'+z.map(x=>`<div class="zone ${level()>=x[1]?"":"lock"}"><b>${level()>=x[1]?"✓":"🔒"} ${x[0]}</b><br><small class="muted">Unlock at level ${x[1]}</small></div>`).join("")+'</div>'}
function more(){return head("More","Achievements, shop, journal and backup.")+`<div class="card">${ACH.map(a=>`<div class="achievement"><span class="badge">${D.ach[a[0]]?a[1]:"○"}</span><div><b>${a[2]}</b><br><small class="muted">${D.ach[a[0]]?"UNLOCKED":"LOCKED"}</small></div></div>`).join("")}</div><div class="card"><b>📝 Journal</b><div class="field"><textarea id="note" rows="4" maxlength="1000" placeholder="Write today's note...">${esc(D.notes[today()]||"")}</textarea></div><button class="btn" onclick="note()">Save note</button></div><div class="card"><b>🪙 Shop</b><div class="row" style="margin-top:12px"><span>⚡ XP Token — 100 coins</span><button class="btn" onclick="buy()">Buy</button></div></div><div class="card"><b>⚙️ Settings & Backup</b><div class="field"><label>Name</label><input id="nm" maxlength="40" value="${esc(D.name)}"></div><div class="field"><label>Daily XP goal</label><input id="goal" type="number" min="1" max="10000" value="${D.goal}"></div><button class="btn" onclick="settings()">Save</button><button class="btn secondary" onclick="backup()" style="margin-left:6px">Export</button><input id="imp" type="file" accept=".json,application/json" style="display:none" onchange="restore(this)"><button class="btn secondary" onclick="document.getElementById('imp').click()" style="margin:6px 0 0 6px">Import</button><button class="btn danger" onclick="resetData()" style="margin-top:10px">Reset all data</button></div>`}
function note(){D.notes[today()]=document.getElementById("note").value.trim();save();toast("Journal saved");render()}
function settings(){D.name=document.getElementById("nm").value.trim()||"Discipline Warrior";D.goal=Math.max(1,Math.min(10000,+document.getElementById("goal").value||100));save();toast("Saved");render()}
function buy(){if(D.coins<100)return toast("Need 100 coins");D.coins-=100;D.xp+=100;check();save();toast("+100 XP");render()}
function backup(){const a=document.createElement("a"),b=new Blob([JSON.stringify(D,null,2)],{type:"application/json"});a.href=URL.createObjectURL(b);a.download="discipline-quest-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function restore(i){const f=i.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(typeof x.xp!=="number"||typeof x.qd!=="object")throw 0;D={...DEFAULT,...x};syncStats();render();toast("Backup restored")}catch{toast("Invalid backup")}};r.readAsText(f)}
function resetData(){if(confirm("Reset all Discipline Quest progress? This cannot be undone unless you exported a backup.")){localStorage.removeItem(K);D={...DEFAULT};render();toast("Progress reset")}}
function go(t){D.tab=t;save();render()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function render(){const page={home,quests,workout,stats,map,more}[D.tab]||home;document.getElementById("app").innerHTML=`<main class="app">${page()}</main>${nav()}`}
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
syncStats();render();
