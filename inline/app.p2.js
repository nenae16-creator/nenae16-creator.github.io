  </div>`;
}
function viewPair(){
  const ev=evById[selectedEvent], hs=heatsOf(ev);
  return `<div class="two"><div class="card scroll-list"><div class="kicker">경기 목록</div><h3>페어링</h3>${evList(selectedEvent)}</div><div class="card"><div class="kicker">EVENT ${String(ev.id).padStart(2,"0")}</div><h2>${ev.name} ${kindB(ev.kind)}</h2><p class="muted">${ev.dist} · ${ev.gender}</p>
    ${hs.map((heat,i)=>`<div class="heat"><div class="heat-hd"><b>${i+1}조</b></div>${(heat||[]).map((aid,li)=>aid?laneRow({athleteId:aid,lane:li+1,...((state.results[ev.id]||{})[keyOf(i+1,aid)]||{})},ev):"").join("")}</div>`).join("")}</div></div>`;
}
function tr(x,place){if(!x.a)return ""; return `<tr data-ath="${x.athleteId}"><td>${rankH(place)}</td><td class="bib">${String(x.athleteId).padStart(2,"0")}</td><td><div class="who"><img class="avatar" src="${avatar(x.a)}"><div><strong>${x.a.name}</strong><span>${clubShort(x.a.club)}</span></div></div></td><td>${x.heat}조</td><td class="time">${x.status&&x.status!=="완주"?x.status:x.time||(x.t!=null?fmtTime(x.t):"—")}</td></tr>`;}
function viewRank(){
  const ev=evById[selectedEvent], pack=rankedEvent(ev), q=ev.qualifyTo?evById[ev.qualifyTo]:null, adv=q?autoQ(q).slice(0,state.qualifyCount):[];
  const heats=pack.heats.map(h=>`<div class="heat"><div class="heat-hd"><b>${h.heat}조 순위</b></div><table class="table"><thead><tr><th>조순위</th><th>번호</th><th>선수</th><th>조</th><th>기록</th></tr></thead><tbody>${h.finished.map(x=>tr(x,x.heatPlace)).join("")+h.others.map(x=>tr(x,x.st)).join("")||'<tr><td colspan="5" class="empty">기록 없음</td></tr>'}</tbody></table></div>`).join("");
  return `<div class="two"><div class="card scroll-list"><div class="kicker">학년·부별</div><h3>순위</h3>${evList(selectedEvent)}</div><div class="card"><h2>${ev.name}</h2><p class="muted">각 조에서 1·2·3등을 따로 매꺁니다. 전체 순위는 기록순 참고입니다.</p>${heats}
    <h3>학년·부별 전체 순위</h3><table class="table"><thead><tr><th>전체</th><th>번호</th><th>선수</th><th>조</th><th>기록</th></tr></thead><tbody>${pack.finished.map(x=>tr(x,x.overallPlace)).join("")||'<tr><td colspan="5" class="empty">아직 기록 없음</td></tr>'}</tbody></table>
    ${q?`<h3>최강전 진출 예상 · ${q.name}</h3>`+ (adv.map((x,i)=>`<div class="q-card yes" data-ath="${x.athleteId}">${rankH(i+1)}<img class="avatar" src="${avatar(x.a)}"><div><b>${x.a.name}</b><div class="muted">${x.heat}조 ${x.fromPlace}등</div></div><span class="badge b-champ">진출</span></div>`).join("")||'<div class="empty">예선 기록 대기</div>'):""}
  </div></div>`;
}
function viewChamp(){
  const champs=DATA.events.filter(e=>e.kind==="최강전");
  return `<div class="card" style="margin-bottom:14px"><div class="kicker">CHAMPIONSHIP</div><h2>피트니스 최강전 진출</h2><p class="muted">각 조 1등 → 2등 → 3등 순으로 상위 ${state.qualifyCount}명</p>
    <label class="muted">진출 인원 <input id="qcount" type="number" min="1" max="12" value="${state.qualifyCount}" style="width:64px;padding:6px;border-radius:8px;border:1px solid var(--line);background:#071525;color:#fff"></label></div>
    <div class="grid cards-3">${champs.map(ev=>{const pool=autoQ(ev),take=pool.slice(0,state.qualifyCount),wait=pool.slice(state.qualifyCount);
      return `<div class="card"><div class="kicker">No.${String(ev.id).padStart(2,"0")}</div><h3>${ev.name.replace("피트니스 ","")}</h3>
        ${take.map((x,i)=>`<div class="q-card yes" data-ath="${x.athleteId}">${rankH(i+1)}<img class="avatar" src="${avatar(x.a)}"><div><b>${x.a.name}</b><div class="muted">${x.heat}조 ${x.fromPlace}등</div></div></div>`).join("")||'<div class="empty">예선 기록 대기</div>'}
        ${wait.slice(0,3).map(x=>`<div class="q-card no" data-ath="${x.athleteId}"><span class="muted">대기</span><b>${x.a.name}</b></div>`).join("")}</div>`;}).join("")}</div>`;
}
function viewMedals(){
  const {clubs,totals}=medals();
  return `<div class="grid cards-3"><div class="card"><div class="kicker">GOLD</div><div class="stat">${totals.gold}</div><div class="muted">각 조 1등</div></div><div class="card"><div class="kicker">SILVER</div><div class="stat">${totals.silver}</div><div class="muted">각 조 2등</div></div><div class="card"><div class="kicker">BRONZE</div><div class="stat">${totals.bronze}</div><div class="muted">각 조 3등</div></div></div>
    <div class="card" style="margin-top:14px"><h2>클럽별 메달</h2>
    <table class="table"><thead><tr><th>클럽</th><th>금</th><th>은</th><th>동</th><th>합</th></tr></thead><tbody>
    ${clubs.map(c=>`<tr><td><b>${c.club}</b></td><td>${c.gold}</td><td>${c.silver}</td><td>${c.bronze}</td><td>${c.total}</td></tr>`).join("")||'<tr><td colspan="5" class="empty">아직 메달 없음</td></tr>'}</tbody></table></div>`;
}
function viewAthletes(){
  const q=($("#qath")&&$("#qath").value||"").trim();
  const list=DATA.athletes.filter(a=>!q||(a.name+a.club+a.grade+a.id).includes(q));
  return `<div class="card"><input class="search" id="qath" placeholder="이름·클럽·번호 검색" value="${q||""}"><div class="photo-grid">${list.map(a=>`<div class="photo-card" data-ath="${a.id}"><img src="${avatar(a)}"><div class="cap"><b>${a.name}</b><div class="muted">No.${a.id} · ${clubShort(a.club)} · ${a.grade}</div></div></div>`).join("")}</div></div>`;
}
function viewJudge(){
  if(!judgeAuthed) return `<div class="card" style="max-width:420px;margin:40px auto"><div class="kicker">JUDGE</div><h2>심판실</h2><p class="muted">암호를 입력하세요.</p><input id="pin" class="search" type="password" placeholder="암호"><button class="btn gold" data-act="login">입장</button></div>`;
  const ev=evById[state.currentEvent]||DATA.events[0], hs=heatsOf(ev);
  const rows=hs.map((heat,i)=>`<div class="heat"><div class="heat-hd"><b>${i+1}조</b></div>${(heat||[]).map((aid,li)=>{
    const a=athById[aid]; if(!a)return "";
    const row=(state.results[ev.id]||{})[keyOf(i+1,aid)]||{time:"",rank:"",status:""};
    return `<div class="lane" style="grid-template-columns:44px 1fr 90px 70px 90px"><div class="bib">${String(a.id).padStart(2,"0")}</div><div><b>${a.name}</b><div class="muted">${clubShort(a.club)}</div></div>
      <input data-ed="time" data-ev="${ev.id}" data-k="${keyOf(i+1,aid)}" value="${row.time||""}" placeholder="기록">
      <input data-ed="rank" data-ev="${ev.id}" data-k="${keyOf(i+1,aid)}" value="${row.rank||""}" placeholder="조순위">
      <select data-ed="status" data-ev="${ev.id}" data-k="${keyOf(i+1,aid)}"><option value="">완주</option><option ${row.status==="DNF"?"selected":""}>DNF</option><option ${row.status==="DNS"?"selected":""}>DNS</option><option ${row.status==="DQ"?"selected":""}>DQ</option></select></div>`;
  }).join("")}</div>`).join("");
  return `<div class="card"><div class="toolbar"><button class="btn" data-act="prev-ev">이전</button><button class="btn primary" data-act="next-ev">다음</button><button class="btn" data-act="export">엑셀 저장</button></div>
    <h2>No.${String(ev.id).padStart(2,"0")} ${ev.name}</h2>
    <div class="drop" id="drop">엑셀 기록지(.xlsx)를 여기에 놓거나 클릭해서 올리세요<input id="file" type="file" accept=".xlsx,.xls,.csv" hidden></div>
    <div class="judge-grid" style="margin-top:12px">${rows}</div></div>`;
}
function openAth(id){
  const a=athById[+id]; if(!a)return;
  const rs=[]; DATA.events.forEach(ev=>entries(ev).forEach(row=>{if(row.athleteId===a.id){const f=rankedEvent(ev).all.find(x=>x.athleteId===a.id); rs.push({ev,place:f?f.heatPlace:"",time:row.time});}}));
  $("#modal").className="modal-bg show";
  $("#modal").innerHTML=`<div class="modal"><img class="hero" src="${avatar(a)}"><div class="body"><h2>${a.name}</h2><div class="chips"><span class="chip">No.${a.id}</span><span class="chip">${a.grade} ${a.gender}</span><span class="chip">${a.club}</span></div>
    ${judgeAuthed?`<div class="toolbar"><label class="btn">사진 올리기<input id="ph" type="file" accept="image/*" hidden></label></div>`:""}
    <table class="table"><thead><tr><th>경기</th><th>조순위</th><th>기록</th></tr></thead><tbody>${rs.map(r=>`<tr><td>${r.ev.name}</td><td>${r.place||"—"}</td><td>${r.time||"—"}</td></tr>`).join("")||'<tr><td colspan="3">출전 없음</td></tr>'}</tbody></table>
    <button class="btn" data-act="close">닫기</button></div></div>`;
  const ph=$("#ph"); if(ph) ph.onchange=e=>{const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{photos[a.id]=r.result; localStorage.setItem(PK,JSON.stringify(photos)); openAth(a.id); render();}; r.readAsDataURL(f);};
}
function bind(){
  $$(".nav button").forEach(b=>b.onclick=()=>setView(b.dataset.view));
  $$("[data-sel]").forEach(el=>el.onclick=()=>{selectedEvent=+el.dataset.sel; state.currentEvent=selectedEvent; render();});
  $$("[data-ath]").forEach(el=>el.onclick=()=>openAth(el.dataset.ath));
  $$("[data-go-medals]").forEach(el=>el.onclick=()=>setView("medals"));
  $$("[data-act]").forEach(el=>el.onclick=()=>{
    const a=el.dataset.act;
    if(a==="prev-ev"){state.currentEvent=Math.max(1,state.currentEvent-1); selectedEvent=state.currentEvent; save(); render();}
    if(a==="next-ev"){state.currentEvent=Math.min(DATA.events.length,state.currentEvent+1); selectedEvent=state.currentEvent; save(); render();}
    if(a==="login"){if(($("#pin")||{}).value===String(DATA.meta.judgePin||"2026")){judgeAuthed=true; sessionStorage.setItem(AK,"1"); toast("입장했습니다"); render();} else toast("암호가 다릅니다");}
    if(a==="close"){$("#modal").className="modal-bg";}
    if(a==="export") exportXlsx();
  });
  const qc=$("#qcount"); if(qc) qc.onchange=()=>{state.qualifyCount=+qc.value||6; save(); render();};
  const qath=$("#qath"); if(qath) qath.oninput=()=>{$("#view").innerHTML=viewAthletes(); bind(); qath.focus(); const v=qath.value; qath.setSelectionRange(v.length,v.length);};
  $$("[data-ed]").forEach(el=>el.onchange=()=>{
    const ev=el.dataset.ev,k=el.dataset.k,f=el.dataset.ed;
    if(!state.results[ev])state.results[ev]={};
    if(!state.results[ev][k])state.results[ev][k]={athleteId:+k.split(":")[1],heat:+k.split(":")[0],time:"",rank:"",status:""};
    state.results[ev][k][f]=el.value; save();
  });
  const drop=$("#drop"), file=$("#file");
  if(drop){drop.onclick=()=>file&&file.click(); drop.ondragover=e=>{e.preventDefault(); drop.classList.add("hot");}; drop.ondragleave=()=>drop.classList.remove("hot"); drop.ondrop=e=>{e.preventDefault(); drop.classList.remove("hot"); if(e.dataTransfer.files[0])readXlsx(e.dataTransfer.files[0]);};}
  if(file) file.onchange=e=>{if(e.target.files[0])readXlsx(e.target.files[0]);};
  $("#modal").onclick=e=>{if(e.target.id==="modal") $("#modal").className="modal-bg";};
}
function readXlsx(file){
  if(!window.XLSX){toast("엑셀 라이브러리 없음"); return;}
  const r=new FileReader();
  r.onload=ev=>{
    const wb=XLSX.read(ev.target.result,{type:"array"});
    const sh=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(sh,{header:1});
    let n=0;
    rows.forEach(row=>{
      const evId=+row[0]||+row[1]; const aid=+row[2]||+row[3];
      const time=row[4]||row[5]||""; const rank=row[6]||""; const status=row[7]||"";
      if(!evId||!aid||!state.results[evId])return;
      const keys=Object.keys(state.results[evId]).filter(k=>k.endsWith(":"+aid));
      keys.forEach(k=>{if(time)state.results[evId][k].time=String(time); if(rank)state.results[evId][k].rank=String(rank); if(status)state.results[evId][k].status=String(status); n++;});
    });
    save(); render(); toast(n?"기록 "+n+"건 반영":"형식을 확인하세요");
  };
  r.readAsArrayBuffer(file);
}
function exportXlsx(){
  if(!window.XLSX)return;
  const rows=[["경기","번호","이름","클럽","조","레인","기록","조순위","상태"]];
  DATA.events.forEach(ev=>entries(ev).forEach(row=>{const a=athById[row.athleteId]; if(!a)return; rows.push([ev.id,a.id,a.name,a.club,row.heat,row.lane,row.time||"",row.rank||"",row.status||""]));}));
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),"기록"); XLSX.writeFile(wb,"천안인라인_기록.xlsx");
}
function render(){
  const u=$("#updated"); if(u)u.textContent=state.updatedAt?("기록 갱신 "+new Date(state.updatedAt).toLocaleTimeString("ko-KR")):"기록 입력 전";
  const root=$("#view");
  root.innerHTML=view==="board"?viewBoard():view==="pair"?viewPair():view==="rank"?viewRank():view==="champ"?viewChamp():view==="medals"?viewMedals():view==="athletes"?viewAthletes():viewJudge();
  bind();
}
function init(){
  render(); shareUI();
  if(roomId){localStorage.setItem(RK,roomId); pullCloud(); setInterval(pullCloud,4000);}
  setInterval(()=>{const c=$("#clock"); if(c)c.textContent=new Date().toLocaleTimeString("ko-KR");},1000);
}
init();
})();
