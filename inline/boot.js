(async function () {
  var view = document.getElementById("view");
  var clock = document.getElementById("clock");
  if (clock) setInterval(function () { clock.textContent = new Date().toLocaleTimeString("ko-KR"); }, 1000);
  function show(msg) {
    if (view) view.innerHTML = '<div class="card"><h2>' + msg + '</h2><p class="muted">잠시만 기다려 주세요.</p></div>';
  }
  async function grab(url) {
    var res = await fetch(url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=20260905d");
    if (!res.ok) throw new Error(url + " " + res.status);
    return res.text();
  }
  try {
    var RAW = "https://cdn.jsdelivr.net/gh/nenae16-creator/cheonan-inline-2026@main/";
    var da = await grab(RAW + "data.p1.txt");
    var db = await grab(RAW + "data.p2.txt");
    eval(da + db);
    if (!window.MEET_DATA) throw new Error("no data");
  } catch (e) {
    show("명단을 불러오지 못했습니다");
    return;
  }
  try {
    var a = await grab("app.p1.js");
    var b = await grab("app.p2.js");
    eval(a + b);
  } catch (e) {
    show("앱 코드를 불러오지 못했습니다");
    console && console.error && console.error(e);
  }
})();
