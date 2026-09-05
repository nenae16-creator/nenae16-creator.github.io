/* compact meet app */
(function(){
const DATA=window.MEET_DATA;
const SK="cheonan_inline_2026_v1", PK="cheonan_inline_2026_photos", AK="cheonan_inline_2026_auth", RK="cheonan_inline_2026_room";
const API="https://jsonblob.com/api/jsonBlob";
let roomId=new URLSearchParams(location.search).get("room")||localStorage.getItem(RK)||"";
let syncing=false, lastCloud="";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function def(){
  const results={};
  DATA.events.forEach(ev=>{
    results[ev.id]={};
    (ev.heats||[]).forEach((heat,hi)=>(heat||[]).forEach((aid,li)=>{
      if(!aid)return;
      results[ev.id][hi+1+":"+aid]={athleteId:aid,heat:hi+1,lane:li+1,time:"",rank:"",status:"",note:""};
    }));
  });
  return {results,currentEvent:1,qualifyCount:DATA.meta.qualifyCount||6,fitnessHeats:{},updatedAt:null};
}
function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem(SK)||"null");
    if(!s)return def();
    const b=def();
    return {...b,...s,results:{...b.results,...(s.results||{})},fitnessHeats:s.fitnessHeats||{}};
  }catch(e){return def();}
}
const state=loadState();
const photos=(()=>{try{return JSON.parse(localStorage.getItem(PK)||"{}");}catch(e){return {};}})();
let view="board", selectedEvent=1, judgeAuthed=sessionStorage.getItem(AK)==="1";
const athById=Object.fromEntries(DATA.athletes.map(a=>[a.id,a]));
const evById=Object.fromEntries(DATA.events.map(e=>[e.id,e]));
const keyOf=(h,a)=>h+":"+a;
function save(){
  state.updatedAt=new Date().toISOString();
  localStorage.setItem(SK,JSON.stringify(state));
  if(roomId&&judgeAuthed)pushCloud();
  shareUI();
}
function payload(){return {meet:"cheonan-inline-2026",state:{results:state.results,currentEvent:state.currentEvent,qualifyCount:state.qualifyCount,fitnessHeats:state.fitnessHeats,updatedAt:state.updatedAt}};}
async function pushCloud(){
  if(!roomId||syncing)return; syncing=true;
  try{await fetch(API+"/"+roomId,{method:"PUT",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload())});}catch(e){}
  syncing=false;
}
async function startShare(){
  try{
    const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload())});
    const loc=res.headers.get("Location")||res.headers.get("X-jsonblob")||"";
    const id=(loc.split("/").pop()||"").trim();
    if(!id)throw 0;
    roomId=id; localStorage.setItem(RK,roomId);
    const u=new URL(location.href); u.searchParams.set("room",roomId); history.replaceState({},"",u);
    toast("공유 링크가 준비되었습니다"); shareUI(); copyShare();
  }catch(e){toast("공유 서버 연결 실패");}
}
async function pullCloud(){
  if(!roomId)return;
  try{
    const res=await fetch(API+"/"+roomId,{headers:{Accept:"application/json"}});
    if(!res.ok)return;
    const data=await res.json();
    if(!data||!data.state)return;
    if(data.state.updatedAt&&data.state.updatedAt===lastCloud)return;
    lastCloud=data.state.updatedAt||"";
    if(judgeAuthed&&data.state.updatedAt&&state.updatedAt&&data.state.updatedAt<state.updatedAt)return;
    Object.assign(state, {results:data.state.results||state.results,currentEvent:data.state.currentEvent||state.currentEvent,qualifyCount:data.state.qualifyCount||state.qualifyCount,fitnessHeats:data.state.fitnessHeats||state.fitnessHeats,updatedAt:data.state.updatedAt||state.updatedAt});
    localStorage.setItem(SK,JSON.stringify(state)); render();
  }catch(e){}
}
function shareUrl(){return location.origin+location.pathname+(roomId?("?room="+encodeURIComponent(roomId)):"");}
function copyShare(){const u=shareUrl(); if(navigator.clipboard) navigator.clipboard.writeText(u).then(()=>toast("링크를 복사했습니다")).catch(()=>prompt("복사",u)); else prompt("복사",u);}
function shareUI(){
  const box=$("#share-box"); if(!box)return;
  box.innerHTML=roomId?'<span class="muted">공유중</span> <button class="btn primary" id="copy-link">링크 복사</button>':'<button class="btn gold" id="start-share">공개 공유 시작</button>';
  const c=$("#copy-link"); if(c)c.onclick=copyShare;
  const s=$("#start-share"); if(s)s.onclick=()=>{if(!judgeAuthed){setView("judge");toast("심판실 입장 후 공유를 시작하세요");return;} startShare();};
}
function toast(m){const el=$("#toast"); el.textContent=m; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2000);}
function clubShort(c){return (c||"").replace("인라인&스키클럽","").replace("롤러스포츠클럽","롤러").replace("체련인라인교실","체련").trim();}
function parseTime(str){
  if(!str)return null; const s=String(str).trim().replace(",",".");
  if(/^(dns|dnf|dq|rel)$/i.test(s))return null;
  if(s.includes(":")){const p=s.split(":"); if(p.length===2)return +p[0]*60+ +p[1]; if(p.length===3)return +p[0]*3600+ +p[1]*60+ +p[2];}
  const n=+s; return Number.isFinite(n)?n:null;
}
function fmtTime(sec){if(sec==null||!Number.isFinite(sec))return "—"; if(sec>=60){const m=Math.floor(sec/60),r=sec-m*60; return m+":"+r.toFixed(2).padStart(5,"0");} return sec.toFixed(2);}
function heatsOf(ev){
  if(ev.kind==="최강전"){
    const c=state.fitnessHeats[ev.id]; if(c&&c.length)return c;
    return [autoQ(ev).slice(0,state.qualifyCount).map(x=>x.athleteId)];
  }
  return ev.heats&&ev.heats.length?ev.heats:[[]];
}
function entries(ev){
  const res=state.results[ev.id]||{}, hs=heatsOf(ev), list=[];
  hs.forEach((heat,hi)=>(heat||[]).forEach((aid,li)=>{
    if(!aid)return;
    const k=keyOf(hi+1,aid), row=res[k]||{athleteId:aid,heat:hi+1,lane:li+1,time:"",rank:"",status:""};
    list.push({...row,athleteId:aid,heat:hi+1,lane:li+1,key:k});
  }));
  return list;
}
function deco(row){const st=(row.status||"").toUpperCase(), t=parseTime(row.time), m=+row.rank; return {...row,t,st,a:athById[row.athleteId],manual:Number.isFinite(m)&&m>0?m:null};}
function cmpT(p,q){if(p.t==null&&q.t==null)return (p.athleteId||0)-(q.athleteId||0); if(p.t==null)return 1; if(q.t==null)return -1; return p.t-q.t|| (p.athleteId||0)-(q.athleteId||0);}
function cmpH(p,q){if(p.manual&&q.manual)return p.manual-q.manual; if(p.manual)return -1; if(q.manual)return 1; return cmpT(p,q);}
function ok(x){return !x.st||x.st==="완주"||x.st==="OK";}
function rankedHeats(ev){
  const g={};
  entries(ev).forEach(row=>{const e=deco(row),h=e.heat||1; (g[h]=g[h]||[]).push(e);});
  return Object.keys(g).map(Number).sort((a,b)=>a-b).map(h=>{
    const all=g[h], fin=all.filter(ok).sort(cmpH), oth=all.filter(x=>!ok(x));
    fin.forEach((x,i)=>{x.heatPlace=x.manual||i+1; x.place=x.heatPlace;});
    oth.forEach(x=>{x.heatPlace=x.st; x.place=x.st;});
    return {heat:h,finished:fin,others:oth,all:fin.concat(oth)};
  });
}
function rankedEvent(ev){
  const heats=rankedHeats(ev);
  const finished=heats.flatMap(h=>h.finished).sort(cmpT);
  finished.forEach((x,i)=>x.overallPlace=i+1);
  const others=heats.flatMap(h=>h.others); others.forEach(x=>x.overallPlace=x.st);
  return {heats,finished,others,all:finished.concat(others)};
}
function autoQ(champ){
  const pool=[];
  (champ.qualifyFrom||[]).forEach(eid=>{
    const ev=evById[eid]; if(!ev)return;
    rankedHeats(ev).forEach(h=>h.finished.forEach(row=>{
      if(row.t==null&&!row.manual)return;
      pool.push({athleteId:row.athleteId,fromEvent:eid,fromPlace:row.heatPlace,heat:h.heat,t:row.t,time:row.time,a:row.a});
    }));
  });
  pool.sort((p,q)=>{
    const hp=typeof p.fromPlace==="number"?p.fromPlace:99, hq=typeof q.fromPlace==="number"?q.fromPlace:99;
    if(hp!==hq)return hp-hq; if(p.t==null&&q.t==null)return 0; if(p.t==null)return 1; if(q.t==null)return -1; return p.t-q.t;
  });
  const seen=new Set(); return pool.filter(x=>seen.has(x.athleteId)?false:(seen.add(x.athleteId),true));
}
function prog(ev){
  const e=entries(ev); if(!e.length)return {total:0,done:0,status:"대기"};
  const done=e.filter(x=>x.time||x.status).length;
  return {total:e.length,done,status:done===0?"대기":done<e.length?"진행":"완료"};
}
function avatar(a){
  if(photos[a.id])return photos[a.id];
  const colors=["#1ec8e6","#5dffc2","#f5c84c","#7aa7ff","#ff6b8a","#c084fc"];
  const c=colors[(a.id||0)%colors.length], ini=(a.name||"?").slice(0,1);
  return "data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="${c}"/><text x="40" y="48" text-anchor="middle" font-size="30" font-family="sans-serif" font-weight="800" fill="#041018">${ini}</text></svg>`);
}
function setView(n){view=n; $$(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===n)); render(); window.scrollTo({top:0,behavior:"smooth"});}
function badge(st){return st==="완료"?'<span class="badge b-done">완료</span>':st==="진행"?'<span class="badge b-wait">진행중</span>':st==="최강전"?'<span class="badge b-champ">최강전</span>':'<span class="badge b-heat">대기</span>';}
function kindB(k){return k==="최강전"?'<span class="badge b-champ">최강전</span>':k==="결승"?'<span class="badge b-final">결승</span>':'<span class="badge b-heat">조별결승</span>';}
function rankH(p){if(p===1)return '<span class="rank-pill r1">1</span>'; if(p===2)return '<span class="rank-pill r2">2</span>'; if(p===3)return '<span class="rank-pill r3">3</span>'; if(p)return '<span class="rank-pill r0">'+p+"</span>"; return "";}
function heatHit(ev,aid){for(const h of rankedHeats(ev)){const x=h.all.find(z=>z.athleteId===aid); if(x)return x;} return null;}
function laneRow(row,ev){
  const a=athById[row.athleteId]; if(!a)return "";
  const rk=heatHit(ev,a.id), place=rk?rk.heatPlace:"", time=row.time|| (rk&&rk.t!=null?fmtTime(rk.t):"");
  return `<div class="lane" data-ath="${a.id}"><div class="lane-no">${row.lane||"-"}</div><div class="bib">${String(a.id).padStart(2,"0")}</div><div class="who"><img class="avatar" src="${avatar(a)}" alt=""><div><strong>${a.name}</strong><span>${clubShort(a.club)} · ${a.grade} ${a.gender}${a.note?" · "+a.note:""}</span></div></div><div class="meta-right"><div class="time">${row.status&&row.status!=="완주"?row.status:(time||"—")}</div>${rankH(place)}</div></div>`;
}
function medals(){
  const by={};
  DATA.events.forEach(ev=>rankedHeats(ev).forEach(h=>h.finished.forEach(row=>{
    const k=row.heatPlace===1?"gold":row.heatPlace===2?"silver":row.heatPlace===3?"bronze":null;
    if(!k||!row.a)return;
    const club=row.a.club||"무소속";
    if(!by[club])by[club]={club,gold:0,silver:0,bronze:0,total:0,items:[]};
    by[club][k]++; by[club].total++;
    by[club].items.push({kind:k,place:row.heatPlace,name:row.a.name,evName:ev.name,heat:h.heat,athleteId:row.athleteId});
  })));
  const clubs=Object.values(by).sort((a,b)=>b.gold-a.gold||b.silver-a.silver||b.bronze-a.bronze||a.club.localeCompare(b.club,"ko"));
  const totals=clubs.reduce((s,c)=>(s.gold+=c.gold,s.silver+=c.silver,s.bronze+=c.bronze,s),{gold:0,silver:0,bronze:0});
  return {clubs,totals};
}
function evList(sel){
  return DATA.events.map(e=>`<div class="event-item ${e.id===sel?"on":""}" data-sel="${e.id}"><div class="eno">${String(e.id).padStart(2,"0")}</div><div style="flex:1"><b>${e.name}</b><div class="muted" style="font-size:12px">${e.kind} · ${heatsOf(e).length}개조</div></div>${badge(prog(e).status)}</div>`).join("");
}
function viewBoard(){
  const cur=evById[state.currentEvent]||DATA.events[0], hs=heatsOf(cur), p=prog(cur), doneN=DATA.events.filter(e=>prog(e).status==="완료").length, {clubs,totals}=medals();
  return `<div class="grid cards-3">
    <div class="card"><div class="kicker">대회</div><div class="stat" style="font-size:18px">${DATA.meta.date}</div><div class="muted">${DATA.meta.start} · ${DATA.athletes.length}명</div></div>
    <div class="card"><div class="kicker">현재 경기</div><div class="stat">No.${String(cur.id).padStart(2,"0")}</div><div class="muted">${cur.name}</div></div>
    <div class="card"><div class="kicker">진행</div><div class="stat">${doneN}<span style="font-size:14px;color:var(--muted)"> / ${DATA.events.length}</span></div><div class="muted">기록 ${p.done}/${p.total||0}</div></div>
  </div>
  <div class="card" style="margin-top:14px"><div class="kicker">CLUB MEDALS</div><h3>클럽 메달 <span class="muted" style="font-size:13px">금 ${totals.gold} · 은 ${totals.silver} · 동 ${totals.bronze}</span></h3>
    <div class="medal-strip">${clubs.map((c,i)=>`<div class="medal-chip" data-go-medals="1"><b>${i+1}. ${clubShort(c.club)||c.club}</b><span class="medal gold">${c.gold}</span><span class="medal silver">${c.silver}</span><span class="medal bronze">${c.bronze}</span></div>`).join("")||'<span class="muted">기록 입력 후 집계</span>'}</div></div>
  <div class="card" style="margin-top:14px"><div class="kicker">LIVE HEAT</div><h2>${cur.name} ${kindB(cur.kind)} ${badge(p.status)}</h2>
    <div class="toolbar"><button class="btn" data-act="prev-ev">이전 경기</button><button class="btn primary" data-act="next-ev">다음 경기</button></div>
    ${hs.map((heat,i)=>`<div class="heat"><div class="heat-hd"><b>${hs.length>1?(i+1)+"조":"결승 조"}</b><span class="muted">${(heat||[]).filter(Boolean).length}명 · 이 조에서 1·2·3등</span></div>${(heat||[]).map((aid,li)=>{if(!aid)return ""; const row=(state.results[cur.id]||{})[keyOf(i+1,aid)]||{athleteId:aid,lane:li+1,time:"",status:""}; return laneRow({...row,lane:li+1,athleteId:aid},cur);}).join("")}</div>`).join("")}
