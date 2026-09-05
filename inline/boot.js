(async function () {
  const RAW = "https://raw.githubusercontent.com/nenae16-creator/cheonan-inline-2026/main/";
  const view = document.getElementById("view");
  const clock = document.getElementById("clock");
  if (clock) setInterval(() => { clock.textContent = new Date().toLocaleTimeString("ko-KR"); }, 1000);
  function show(msg) {
    view.innerHTML = '<div class="card"><h2>' + msg + "</h2><p class=\"muted\">잠시만 기다려 주세요. 포더에서 파일을 불러오고 있습니다.</p></div>";
  }
  try {
    const da = await (await fetch(RAW + "data.p1.txt")).text();
    const db = await (await fetch(RAW + "data.p2.txt")).text();
    eval(da + db);
  } catch (e) {
    show("명단을 불러오지 못했습니다");
    return;
  }
  const D = window.MEET_DATA;
  if (!D) { show("명단 데이터 오류"); return; }
  const html = D.events.map(function (ev) {
    const heats = ev.heats && ev.heats.length ? ev.heats : [[]];
    const body = heats.map(function (h, i) {
      const rows = (h || []).map(function (id) {
        const a = D.athletes.find(function (x) { return x.id === id; });
        if (!a) return "";
        return '<div class="lane"><div class="bib">' + String(a.id).padStart(2,"0") + "</div><div><b>" + a.name + "</b><div class=\"muted\">" + a.club + " · " + a.grade + " " + a.gender + "</div></div></div>";
      }).join("");
      return '<div class="heat"><div class="heat-hd"><b>' + (i+1) + "조</b></div>" + rows + "</div>";
    }).join("");
    return '<div class="card" style="margin-bottom:12px"><div class="kicker">No.' + String(ev.id).padStart(2,"0") + "</div><h3>" + ev.name + "</h3>" + body + "</div>";
  }).join("");
  view.innerHTML = '<div class="card"><h2>페어링 · 전광판</h2><p class=\"muted\">주소: https://nenae16-creator.github.io/inline/</p></div>' + html;
})();
