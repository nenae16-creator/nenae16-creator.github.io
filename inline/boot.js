(function () {
  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }
  (async function () {
    var view = document.getElementById("view");
    try {
      if (!window.MEET_DATA) await load("data.js");
      await load("app.js");
    } catch (e) {
      if (view) view.innerHTML = '<div class="card"><h2>앱을 불러오지 못했습니다</h2><p class="muted">페이지를 한 번 새로고침 해 주세요.</p></div>';
    }
  })();
})();
