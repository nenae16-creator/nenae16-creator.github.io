(async function () {
  try {
    const da = await (await fetch("data.p1.txt")).text();
    const db = await (await fetch("data.p2.txt")).text();
    eval(da + db);
    const parts = await Promise.all(
      ["app.b0.txt", "app.b1.txt", "app.b2.txt", "app.b3.txt"].map((f) => fetch(f).then((r) => r.text()))
    );
    eval(decodeURIComponent(escape(atob(parts.join("")))));
  } catch (e) {
    document.getElementById("view").innerHTML =
      '<div class="card"><h2>파일을 불러오지 못했습니다</h2><p class="muted">' +
      e +
      "</p></div>";
  }
})();
