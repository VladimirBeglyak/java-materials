/* SPRING / WEBFLUX — навигация, прогресс, подсветка кода, пошаговые симуляторы, тесты. Работает и через file:// */
(function () {
  "use strict";

  var PAGES = [
    { id: "00", file: "index.html", title: "Карта курса", group: null },
    { id: "01", file: "01-why-reactive.html", title: "Зачем реактивность: event loop против потока на запрос", tier: "j", group: "Reactor" },
    { id: "02", file: "02-reactive-streams.html", title: "Reactive Streams и Reactor: сигналы и подписка", tier: "m", group: "Reactor" },
    { id: "03", file: "03-mono-flux.html", title: "Mono и Flux: создание, cold и hot", tier: "j", group: "Reactor" },
    { id: "04", file: "04-operators.html", title: "Операторы: map, flatMap, concatMap, switchMap", tier: "m", group: "Reactor" },
    { id: "05", file: "05-combining.html", title: "Комбинирование: zip, merge, concat, buffer, groupBy", tier: "m", group: "Reactor" },
    { id: "06", file: "06-errors.html", title: "Ошибки, повторы и таймауты", tier: "m", group: "Reactor" },
    { id: "07", file: "07-schedulers.html", title: "Планировщики: publishOn и subscribeOn", tier: "s", group: "Reactor" },
    { id: "08", file: "08-backpressure-sinks.html", title: "Противодавление и Sinks", tier: "s", group: "Reactor" },
    { id: "09", file: "09-context.html", title: "Reactor Context и пропагация контекста", tier: "s", group: "Reactor" },
    { id: "10", file: "10-architecture.html", title: "Архитектура WebFlux: путь запроса", tier: "m", group: "WebFlux" },
    { id: "11", file: "11-annotated.html", title: "Аннотированные контроллеры", tier: "j", group: "WebFlux" },
    { id: "12", file: "12-functional.html", title: "Функциональные эндпоинты", tier: "m", group: "WebFlux" },
    { id: "13", file: "13-filters-codecs.html", title: "WebFilter, кодеки и лимиты", tier: "m", group: "WebFlux" },
    { id: "14", file: "14-streaming.html", title: "Стриминг: SSE, NDJSON, WebSocket", tier: "m", group: "WebFlux" },
    { id: "15", file: "15-webclient.html", title: "WebClient и Reactor Netty", tier: "m", group: "WebFlux" },
    { id: "16", file: "16-r2dbc.html", title: "R2DBC и реактивный доступ к данным", tier: "m", group: "WebFlux" },
    { id: "17", file: "17-security.html", title: "Реактивный Spring Security", tier: "s", group: "WebFlux" },
    { id: "18", file: "18-testing.html", title: "Тестирование: StepVerifier и WebTestClient", tier: "m", group: "Эксплуатация" },
    { id: "19", file: "19-debugging.html", title: "Отладка реактивного кода", tier: "m", group: "Эксплуатация" },
    { id: "20", file: "20-performance.html", title: "Производительность и блокировка event loop", tier: "s", group: "Эксплуатация" },
    { id: "21", file: "21-mvc-vs-webflux.html", title: "WebFlux или MVC на виртуальных потоках", tier: "m", group: "Эксплуатация" },
    { id: "22", file: "22-practice.html", title: "Практикум и собеседование", tier: "s", group: "Эксплуатация" }
  ];
  var TIER = { j: "Junior", m: "Middle", s: "Senior" };
  var KEY = "wf-guide-done-v1";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var state = load();
  var current = "00";

  /* ---------- Theme ---------- */
  try { var th = localStorage.getItem("wf-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("wf-theme", next); } catch (e) {}
  }

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    var aside = document.querySelector(".sidebar");
    if (!aside) return;
    var html = '<a class="hub-link" href="../index.html">← Все пособия</a>';
    html += '<a class="brand" href="index.html"><b>SPRING / WEBFLUX</b><span>Реактивный стек изнутри</span></a>';
    html += '<div class="progress-wrap"><div class="progress-bar"><i id="pbar"></i></div><div class="progress-label" id="plabel"></div></div>';
    html += '<ul class="nav-list">';
    var g = null;
    PAGES.forEach(function (p) {
      if (p.group && p.group !== g) { g = p.group; html += '</ul><div class="nav-group">' + g + '</div><ul class="nav-list">'; }
      var cls = (p.id === current ? "current " : "") + (state[p.id] ? "done" : "");
      html += '<li><a class="' + cls + '" href="' + p.file + '"><span class="num">' + p.id + '</span><span>' + p.title +
        '</span>' + (p.id === "00" ? "<span></span>" : '<span class="done-mark" title="изучено"></span>') + "</a></li>";
    });
    html += "</ul>";
    html += '<button class="theme-toggle" type="button">◐ Светлая / тёмная тема</button>';
    aside.innerHTML = html;
    aside.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
    updateProgress();

    if (!document.querySelector(".menu-btn")) {
      var mb = document.createElement("button");
      mb.className = "menu-btn"; mb.type = "button"; mb.textContent = "☰ Темы";
      mb.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
      document.body.appendChild(mb);
    }
  }

  function updateProgress() {
    var total = PAGES.length - 1, done = 0;
    PAGES.forEach(function (p) { if (p.id !== "00" && state[p.id]) done++; });
    var bar = document.getElementById("pbar"), lab = document.getElementById("plabel");
    if (bar) bar.style.width = Math.round(done / total * 100) + "%";
    if (lab) lab.textContent = "Изучено " + done + " из " + total;
    document.querySelectorAll("[data-rm]").forEach(function (el) {
      el.classList.toggle("done", !!state[el.getAttribute("data-rm")]);
    });
  }

  /* ---------- Footer: mark done + prev/next ---------- */
  function buildFooter() {
    var c = document.querySelector(".content");
    if (!c || current === "00") return;
    var idx = PAGES.findIndex(function (p) { return p.id === current; });
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<label class="mark-done"><input type="checkbox" id="doneBox"><span><b>Тема изучена.</b> Я отвечаю на вопросы для самопроверки без подсказок и могу объяснить механизм «изнутри» — что происходит внутри и почему.</span></label>';
    var pager = '<nav class="pager">';
    var prev = PAGES[idx - 1], next = PAGES[idx + 1];
    if (prev) pager += '<a class="prev" href="' + prev.file + '"><small>← Назад</small>' + prev.title + "</a>";
    if (next) pager += '<a class="next" href="' + next.file + '"><small>Дальше →</small>' + next.title + "</a>";
    pager += "</nav>";
    wrap.innerHTML += pager;
    c.appendChild(wrap);
    var box = document.getElementById("doneBox");
    box.checked = !!state[current];
    box.addEventListener("change", function () {
      if (box.checked) state[current] = true; else delete state[current];
      save(state); buildSidebar();
    });
  }

  /* ---------- Page header tier badge ---------- */
  function decorateHead() {
    var p = PAGES.find(function (x) { return x.id === current; });
    var meta = document.querySelector(".page-head .meta");
    if (p && p.tier && meta) {
      var s = document.createElement("span");
      s.className = "tag tier " + p.tier; s.textContent = TIER[p.tier];
      meta.insertBefore(s, meta.firstChild);
    }
  }

  /* ---------- Syntax highlight: Java (по умолчанию), YAML / properties ---------- */
  var KW = "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while var record sealed permits yield null true false";
  var kwRe = new RegExp("^(" + KW.split(" ").join("|") + ")$");
  var tokenRe = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])')|(@[A-Za-z_]\w*)|\b(\d[\d_]*(?:\.\d+)?[LlFfDd]?)\b|\b([A-Za-z_]\w*)\b/g;
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function highlightJava(src) {
    var out = "", last = 0, m;
    tokenRe.lastIndex = 0;
    while ((m = tokenRe.exec(src))) {
      out += esc(src.slice(last, m.index));
      var t = m[0];
      if (m[1]) out += '<span class="tk-com">' + esc(t) + "</span>";
      else if (m[2]) out += '<span class="tk-str">' + esc(t) + "</span>";
      else if (m[3]) out += '<span class="tk-ann">' + esc(t) + "</span>";
      else if (m[4]) out += '<span class="tk-num">' + esc(t) + "</span>";
      else if (kwRe.test(t)) out += '<span class="tk-kw">' + t + "</span>";
      else if (/^[A-Z][A-Za-z0-9_]*$/.test(t) && !/^[A-Z0-9_]+$/.test(t)) out += '<span class="tk-type">' + t + "</span>";
      else out += esc(t);
      last = m.index + t.length;
    }
    return out + esc(src.slice(last));
  }
  function highlightConf(src) {
    return src.split("\n").map(function (line) {
      var m = line.match(/^(\s*)(#.*)$/);
      if (m) return m[1] + '<span class="tk-com">' + esc(m[2]) + "</span>";
      m = line.match(/^(\s*-?\s*)([\w.\-\[\]"$@{}]+)(\s*[:=])(.*)$/);
      if (m) {
        var val = m[4], com = "", ci = val.indexOf(" #");
        if (ci >= 0) { com = val.slice(ci); val = val.slice(0, ci); }
        return esc(m[1]) + '<span class="tk-key">' + esc(m[2]) + "</span>" + esc(m[3]) +
          '<span class="tk-str">' + esc(val) + "</span>" + (com ? '<span class="tk-com">' + esc(com) + "</span>" : "");
      }
      return esc(line);
    }).join("\n");
  }
  function addCopy(pre, raw) {
    var b = document.createElement("button");
    b.className = "copy-btn"; b.type = "button"; b.textContent = "copy";
    b.addEventListener("click", function () {
      var done = function () { b.textContent = "✓"; setTimeout(function () { b.textContent = "copy"; }, 1200); };
      var fallback = function () {
        var ta = document.createElement("textarea"); ta.value = raw; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {} ta.remove();
      };
      if (navigator.clipboard) navigator.clipboard.writeText(raw).then(done, fallback); else fallback();
    });
    if (pre.hasAttribute("data-title")) b.style.top = "4px";
    pre.appendChild(b);
  }
  function highlightAll() {
    document.querySelectorAll("pre > code").forEach(function (el) {
      var raw = el.textContent.replace(/^\n/, "");
      if (el.classList.contains("yaml") || el.classList.contains("props")) el.innerHTML = highlightConf(raw);
      else if (el.classList.contains("txt")) el.textContent = raw;
      else el.innerHTML = highlightJava(raw);
      addCopy(el.parentNode, raw);
    });
  }

  /* ---------- Auto TOC from h2 ---------- */
  function buildToc() {
    var holder = document.querySelector(".toc[data-auto]");
    if (!holder) return;
    var hs = document.querySelectorAll(".content h2[id]");
    var html = "<strong>На этой странице</strong><ol>";
    hs.forEach(function (h) { html += '<li><a href="#' + h.id + '">' + h.textContent.replace(/^\d+(\.\d+)?\s*/, "") + "</a></li>"; });
    holder.innerHTML = html + "</ol>";
  }

  /* ---------- Пошаговый симулятор ----------
     <div class="widget stepper"> … <section class="st-step" data-t="заголовок" data-hl="id1 id2" data-log="строка лога">…</section> …
     data-hl  — id элементов, которые подсвечиваются на этом шаге (пройденные получают класс .was)
     data-from / data-to (на любом элементе внутри виджета) — элемент виден с шага N (1-based) и скрывается начиная с шага M */
  function initSteppers() {
    document.querySelectorAll(".stepper").forEach(function (w) {
      var steps = [].slice.call(w.querySelectorAll(".st-step"));
      if (!steps.length) return;
      var body = document.createElement("div"); body.className = "st-body";
      var list = document.createElement("ol"); list.className = "st-list";
      var view = document.createElement("div"); view.className = "st-view";
      steps[0].parentNode.insertBefore(body, steps[0]);
      body.appendChild(list); body.appendChild(view);
      steps.forEach(function (s, i) {
        view.appendChild(s);
        var li = document.createElement("li"), b = document.createElement("button");
        b.type = "button";
        b.innerHTML = "<i>" + (i + 1) + "</i><span>" + esc(s.getAttribute("data-t") || "Шаг " + (i + 1)) + "</span>";
        b.addEventListener("click", function () { stop(); go(i); });
        li.appendChild(b); list.appendChild(li);
      });
      var ctr = document.createElement("div"); ctr.className = "controls";
      ctr.innerHTML = '<button class="btn" type="button" data-a="prev">← Назад</button>' +
        '<button class="btn primary" type="button" data-a="next">Дальше →</button>' +
        '<button class="btn" type="button" data-a="play">▶ Авто</button>' +
        '<button class="btn" type="button" data-a="reset">↺ Сначала</button><span class="st-count"></span>';
      var anchor = w.querySelector(".st-controls");
      if (anchor) anchor.appendChild(ctr); else w.insertBefore(ctr, w.querySelector(".st-stage") || body);
      var log = null;
      if (steps.some(function (s) { return s.hasAttribute("data-log"); })) {
        log = document.createElement("div"); log.className = "log";
        body.parentNode.insertBefore(log, body.nextSibling);
      }
      var btn = function (a) { return ctr.querySelector('[data-a="' + a + '"]'); };
      var count = ctr.querySelector(".st-count");
      var cur = 0, timer = null;
      function ids(s) { return (s.getAttribute("data-hl") || "").split(/\s+/).filter(Boolean); }
      function el(id) { return document.getElementById(id); }
      function go(i) {
        cur = Math.max(0, Math.min(steps.length - 1, i));
        w.querySelectorAll(".hl, .was").forEach(function (e) { e.classList.remove("hl", "was"); });
        steps.forEach(function (s, k) {
          s.hidden = k !== cur;
          list.children[k].className = k === cur ? "cur" : (k < cur ? "past" : "");
          if (k < cur) ids(s).forEach(function (id) { var e = el(id); if (e) e.classList.add("was"); });
        });
        ids(steps[cur]).forEach(function (id) { var e = el(id); if (e) { e.classList.remove("was"); e.classList.add("hl"); } });
        w.querySelectorAll("[data-from], [data-to]").forEach(function (e) {
          var f = +(e.getAttribute("data-from") || 0), t = +(e.getAttribute("data-to") || 1e9);
          e.hidden = !(cur + 1 >= f && cur + 1 < t);
        });
        btn("prev").disabled = cur === 0;
        btn("next").disabled = cur === steps.length - 1;
        count.textContent = (cur + 1) + " / " + steps.length;
        if (log) log.textContent = steps.slice(0, cur + 1).map(function (s) { return s.getAttribute("data-log"); }).filter(Boolean).join("\n");
        var li = list.children[cur];
        if (li && list.scrollHeight > list.clientHeight) list.scrollTop = li.offsetTop - list.offsetTop - 40;
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; btn("play").textContent = "▶ Авто"; } }
      btn("prev").addEventListener("click", function () { stop(); go(cur - 1); });
      btn("next").addEventListener("click", function () { stop(); go(cur + 1); });
      btn("reset").addEventListener("click", function () { stop(); go(0); });
      btn("play").addEventListener("click", function () {
        if (timer) { stop(); return; }
        if (cur === steps.length - 1) go(0);
        btn("play").textContent = "❚❚ Пауза";
        timer = setInterval(function () { if (cur >= steps.length - 1) stop(); else go(cur + 1); }, 2600);
      });
      go(0);
    });
  }

  /* ---------- Тесты с выбором ответа ----------
     <div class="mcq" data-ok="1"><p>Вопрос</p><ul><li>…</li><li>…</li></ul><div class="why">Объяснение</div></div>
     data-ok — индекс верного варианта (с нуля). Счёт выводится в .mcq-score, если он есть на странице. */
  function initMcq() {
    var all = document.querySelectorAll(".mcq");
    if (!all.length) return;
    var right = 0, answered = 0, score = document.querySelector(".mcq-score");
    function upd() { if (score) score.textContent = answered ? "Верно " + right + " из " + answered + " · всего вопросов " + all.length : "Вопросов: " + all.length + ". Выберите ответ — появится объяснение."; }
    all.forEach(function (q) {
      var ok = +q.getAttribute("data-ok"), items = q.querySelectorAll("li"), why = q.querySelector(".why");
      if (why) why.hidden = true;
      var btns = [];
      items.forEach(function (li, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "mcq-opt"; b.innerHTML = li.innerHTML;
        li.innerHTML = ""; li.appendChild(b); btns.push(b);
        b.addEventListener("click", function () {
          if (q.classList.contains("answered")) return;
          q.classList.add("answered"); answered++;
          if (i === ok) right++; else b.classList.add("wrong");
          if (btns[ok]) btns[ok].classList.add("right");
          if (why) why.hidden = false;
          upd();
        });
      });
    });
    upd();
  }

  window.SG = { pages: PAGES, state: state, esc: esc };
  document.addEventListener("DOMContentLoaded", function () {
    current = document.body.getAttribute("data-page") || "00";
    buildSidebar(); decorateHead(); buildToc(); highlightAll(); initSteppers(); initMcq(); buildFooter(); updateProgress();
  });
})();


/* ===== Marble-диаграммы Reactor =====
   Marble.render(elementOrId, lanes, opts)
   lanes: [{ label: "source", events: [{ t: 10, v: "1", type: "next"|"error"|"complete", c: 0..5 }] , note: "…" }]
   opts: { T: 100 } — длина шкалы времени в условных единицах */
(function () {
  "use strict";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function render(el, lanes, opts) {
    if (typeof el === "string") el = document.getElementById(el);
    if (!el) return;
    opts = opts || {};
    var T = opts.T || 100, W = 720, X0 = 118, X1 = W - 16, H = 50, top = 8;
    var hgt = top + lanes.length * H + 4, s = "";
    function x(t) { return X0 + Math.max(0, Math.min(T, t)) / T * (X1 - X0); }
    lanes.forEach(function (ln, i) {
      var y = top + i * H + 26, end = null, lastNext = -1e9, pos = [];
      var evs = (ln.events || []).map(function (e, k) { return { e: e, k: k }; }).sort(function (a, b) { return a.e.t - b.e.t || a.k - b.k; });
      evs.forEach(function (o) {
        var e = o.e, base = x(e.t), px;
        if (e.type === "complete" || e.type === "error") { px = Math.min(X1 - 2, Math.max(base, lastNext + 17)); end = px; }
        else { px = Math.min(X1 - 12, Math.max(base, lastNext + 23)); lastNext = px; }
        pos.push({ e: e, x: px });
      });
      var lineEnd = end === null ? X1 : end;
      s += '<text class="mb-label" x="6" y="' + (y + 4) + '">' + esc(ln.label) + "</text>";
      s += '<line class="mb-line" x1="' + X0 + '" y1="' + y + '" x2="' + lineEnd + '" y2="' + y + '"/>';
      if (end === null) s += '<path class="mb-arrow" d="M' + (X1 - 6) + "," + (y - 5) + " L" + X1 + "," + y + " L" + (X1 - 6) + "," + (y + 5) + '"/>';
      pos.forEach(function (p) {
        var e = p.e, cx = p.x.toFixed(1);
        if (e.type === "complete") s += '<line class="mb-complete" x1="' + cx + '" y1="' + (y - 11) + '" x2="' + cx + '" y2="' + (y + 11) + '"/>';
        else if (e.type === "error") s += '<path class="mb-error" d="M' + (p.x - 7) + "," + (y - 7) + " L" + (p.x + 7) + "," + (y + 7) + " M" + (p.x + 7) + "," + (y - 7) + " L" + (p.x - 7) + "," + (y + 7) + '"/>' + (e.v ? '<text class="mb-etext" x="' + cx + '" y="' + (y + 22) + '" text-anchor="middle">' + esc(e.v) + "</text>" : "");
        else s += '<circle class="mb-next mb-c' + (e.c || 0) + '" cx="' + cx + '" cy="' + y + '" r="11"/><text class="mb-val" x="' + cx + '" y="' + (y + 4) + '" text-anchor="middle">' + esc(e.v) + "</text>";
      });
      if (ln.note) s += '<text class="mb-note" x="' + X0 + '" y="' + (y - 15) + '">' + esc(ln.note) + "</text>";
    });
    el.innerHTML = '<svg class="marble" viewBox="0 0 ' + W + " " + hgt + '" role="img" aria-label="marble-диаграмма">' + s + "</svg>";
  }
  window.Marble = { render: render };
})();
