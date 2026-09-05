(async function () {
  var view = document.getElementById("view");
  var clock = document.getElementById("clock");
  if (clock) setInterval(function () { clock.textContent = new Date().toLocaleTimeString("ko-KR"); }, 1000);
  function show(msg) {
    if (view) view.innerHTML = '<div class="card"><h2>' + msg + '</h2><p class="muted">잠시만 기다려 주세요.</p></div>';
  }
  async function grab(url) {
    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(url + " " + res.status);
    return res.text();
  }
  async function firstOk(urls) {
    var last;
    for (var i = 0; i < urls.length; i++) {
      try { return await grab(urls[i]); } catch (e) { last = e; }
    }
    throw last || new Error("all failed");
  }
  try {
    var RAW = "https://cdn.jsdelivr.net/gh/nenae16-creator/cheonan-inline-2026@main/";
    var da = await firstOk([RAW + "data.p1.txt", "https://raw.githubusercontent.com/nenae16-creator/cheonan-inline-2026/main/data.p1.txt"]);
    var db = await firstOk([RAW + "data.p2.txt", "https://raw.githubusercontent.com/nenae16-creator/cheonan-inline-2026/main/data.p2.txt"]);
    eval(da + db);
    if (!window.MEET_DATA) throw new Error("no data");
  } catch (e) {
    show("명단을 불러오지 못했습니다");
    return;
  }
  try {
    var BASE = "https://raw.githubusercontent.com/nenae16-creator/nenae16-creator.github.io/main/inline/";
    var a = await firstOk([BASE + "app.p1.js", "app.p1.js"]);
    var b = await firstOk([BASE + "app.p2.js", "app.p2.js"]);
    eval(a + b);
  } catch (e) {
    show("앱 코드를 불러오지 못했습니다");
    console && console.error && console.error(e);
  }
})();
