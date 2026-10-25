/* Java Core — навигация, прогресс, подсветка кода. Работает и через file:// */
(function () {
  "use strict";

  var PAGES = [
    { id: "00", file: "index.html", title: "Карта курса", group: null },
    { id: "01", file: "01-platform.html", title: "Платформа: JDK, JVM, байткод", tier: "j", group: "Основа языка" },
    { id: "02", file: "02-types.html", title: "Типы, обёртки, передача по значению", tier: "j", group: "Основа языка" },
    { id: "24", file: "24-syntax.html", title: "Операторы, управление, массивы, методы", tier: "j", group: "Основа языка" },
    { id: "03", file: "03-strings.html", title: "String и строковый пул", tier: "j", group: "Основа языка" },
    { id: "04", file: "04-oop.html", title: "ООП: классы, наследование, интерфейсы", tier: "j", group: "Основа языка" },
    { id: "05", file: "05-object-contract.html", title: "equals, hashCode, иммутабельность", tier: "j", group: "Основа языка" },
    { id: "06", file: "06-exceptions.html", title: "Исключения", tier: "j", group: "Основа языка" },
    { id: "07", file: "07-generics.html", title: "Generics и стирание типов", tier: "m", group: "Типы и коллекции" },
    { id: "08", file: "08-collections.html", title: "Коллекции: List, Queue, Deque", tier: "j", group: "Типы и коллекции" },
    { id: "09", file: "09-hashmap.html", title: "HashMap изнутри, Map и Set", tier: "m", group: "Типы и коллекции" },
    { id: "10", file: "10-lambdas.html", title: "Лямбды, функциональные интерфейсы, Optional", tier: "m", group: "Функциональный стиль" },
    { id: "11", file: "11-streams.html", title: "Stream API", tier: "m", group: "Функциональный стиль" },
    { id: "12", file: "12-modern-java.html", title: "Современная Java: records, sealed, pattern matching", tier: "m", group: "Функциональный стиль" },
    { id: "13", file: "13-io.html", title: "I/O, NIO, сериализация", tier: "m", group: "Платформа изнутри" },
    { id: "14", file: "14-memory-gc.html", title: "Память JVM и сборка мусора", tier: "s", group: "Платформа изнутри" },
    { id: "15", file: "15-classloading-reflection.html", title: "Загрузка классов, рефлексия, JIT", tier: "s", group: "Платформа изнутри" },
    { id: "25", file: "25-javac.html", title: "Компилятор javac изнутри", tier: "s", group: "Платформа изнутри" },
    { id: "16", file: "16-practice.html", title: "Практика и собеседование", tier: "s", group: "Платформа изнутри" },
    { id: "17", file: "17-datetime.html", title: "Дата и время: java.time", tier: "m", group: "Инженерная практика" },
    { id: "18", file: "18-text-regex.html", title: "Текст: Unicode, форматирование, regex", tier: "m", group: "Инженерная практика" },
    { id: "19", file: "19-design-patterns.html", title: "Паттерны проектирования", tier: "m", group: "Инженерная практика" },
    { id: "20", file: "20-solid-clean-code.html", title: "SOLID и чистый код", tier: "m", group: "Инженерная практика" },
    { id: "21", file: "21-build-tools.html", title: "Сборка: classpath, JAR, Maven, Gradle", tier: "j", group: "Инженерная практика" },
    { id: "22", file: "22-jdbc.html", title: "JDBC: работа с базой данных", tier: "m", group: "Инженерная практика" },
    { id: "23", file: "23-testing.html", title: "Тестирование: JUnit 5, AssertJ, Mockito", tier: "m", group: "Инженерная практика" }
  ];
  var TIER = { j: "Junior", m: "Middle", s: "Senior" };
  var KEY = "jcore-guide-done-v1";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var state = load();
  var current = "00";

  /* ---------- Theme ---------- */
  try { var th = localStorage.getItem("jcore-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("jcore-theme", next); } catch (e) {}
  }

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    var aside = document.querySelector(".sidebar");
    if (!aside) return;
    var html = '<a class="hub-link" href="../index.html">← Все пособия</a>';
    html += '<a class="brand" href="index.html"><b>JAVA / CORE</b><span>Язык и платформа</span></a>';
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

    var mb = document.createElement("button");
    mb.className = "menu-btn"; mb.type = "button"; mb.textContent = "☰ Темы";
    mb.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    document.body.appendChild(mb);
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
      '<label class="mark-done"><input type="checkbox" id="doneBox"><span><b>Тема изучена.</b> Я могу ответить на все вопросы для самопроверки без подсказок и написать примеры с нуля.</span></label>';
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

  /* ---------- Java syntax highlight ---------- */
  var KW = "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while var record sealed permits yield null true false";
  var kwRe = new RegExp("\\b(" + KW.split(" ").join("|") + ")\\b");
  var tokenRe = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])')|(@[A-Za-z_]\w*)|\b(\d[\d_]*(?:\.\d+)?[LlFfDd]?)\b|\b([A-Za-z_]\w*)\b/g;
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function highlight(src) {
    var out = "", last = 0, m;
    tokenRe.lastIndex = 0;
    while ((m = tokenRe.exec(src))) {
      out += esc(src.slice(last, m.index));
      var t = m[0];
      if (m[1]) out += '<span class="tk-com">' + esc(t) + "</span>";
      else if (m[2]) out += '<span class="tk-str">' + esc(t) + "</span>";
      else if (m[3]) out += '<span class="tk-ann">' + esc(t) + "</span>";
      else if (m[4]) out += '<span class="tk-num">' + esc(t) + "</span>";
      else if (kwRe.test(t) && kwRe.exec(t)[0] === t) out += '<span class="tk-kw">' + t + "</span>";
      else if (/^[A-Z][A-Za-z0-9_]*$/.test(t) && !/^[A-Z0-9_]+$/.test(t)) out += '<span class="tk-type">' + t + "</span>";
      else out += esc(t);
      last = m.index + t.length;
    }
    return out + esc(src.slice(last));
  }
  function highlightAll() {
    document.querySelectorAll("pre > code.java, pre > code:not([class])").forEach(function (el) {
      var raw = el.textContent.replace(/^\n/, "");
      el.innerHTML = highlight(raw);
      var pre = el.parentNode;
      var b = document.createElement("button");
      b.className = "copy-btn"; b.type = "button"; b.textContent = "copy";
      b.addEventListener("click", function () {
        var done = function () { b.textContent = "✓"; setTimeout(function () { b.textContent = "copy"; }, 1200); };
        if (navigator.clipboard) navigator.clipboard.writeText(raw).then(done, function () {});
        else { var ta = document.createElement("textarea"); ta.value = raw; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
      });
      if (!pre.hasAttribute("data-title")) pre.appendChild(b); else { b.style.top = "4px"; pre.appendChild(b); }
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


  /* ---------- Практикум: лабораторные ----------
     .lab[data-lab] > .lab-steps > .lab-step — галочка «сделал» на каждом шаге (сохраняется);
     .lab-step.predict — поле прогноза (сохраняется) и кнопка «Сверить», открывающая .lab-ans. */
  function initLabs() {
    var labs = document.querySelectorAll(".lab[data-lab]");
    if (!labs.length) return;
    var LK = KEY + "-labs", st = {};
    try { st = JSON.parse(localStorage.getItem(LK) || "{}") || {}; } catch (e) {}
    var put = function () { try { localStorage.setItem(LK, JSON.stringify(st)); } catch (e) {} };
    var intro = document.querySelector(".lab-intro");
    if (intro) {
      var tm = document.createElement("label"); tm.className = "lab-mode";
      tm.innerHTML = '<input type="checkbox"> Режим «набираю руками»: скрыть кнопки copy в лабораторных';
      var tb = tm.querySelector("input");
      try { tb.checked = localStorage.getItem(KEY + "-typing") === "1"; } catch (e) {}
      document.body.classList.toggle("typing-mode", tb.checked);
      tb.addEventListener("change", function () {
        document.body.classList.toggle("typing-mode", tb.checked);
        try { localStorage.setItem(KEY + "-typing", tb.checked ? "1" : "0"); } catch (e) {}
      });
      intro.appendChild(tm);
    }
    labs.forEach(function (lab) {
      var id = lab.getAttribute("data-lab"), rec = st[id] || (st[id] = { d: {}, g: {} });
      var steps = lab.querySelectorAll(".lab-step"), prog = lab.querySelector(".lab-prog");
      function upd() {
        var n = 0; steps.forEach(function (s, i) { if (rec.d[i]) n++; });
        prog.textContent = "сделано " + n + " / " + steps.length;
        prog.classList.toggle("full", n === steps.length);
      }
      steps.forEach(function (s, i) {
        var l = document.createElement("label"); l.className = "lab-chk";
        l.innerHTML = '<input type="checkbox"> сделал';
        var cb = l.querySelector("input"); cb.checked = !!rec.d[i]; s.classList.toggle("done", cb.checked);
        cb.addEventListener("change", function () { if (cb.checked) rec.d[i] = 1; else delete rec.d[i]; s.classList.toggle("done", cb.checked); put(); upd(); });
        s.appendChild(l);
        if (s.classList.contains("predict")) {
          var ans = s.querySelector(".lab-ans"), g = document.createElement("div"); g.className = "lab-guess";
          g.innerHTML = '<textarea placeholder="Ваш прогноз: что произойдёт и почему?"></textarea><button class="btn primary" type="button">Сверить</button>';
          var ta = g.querySelector("textarea"), b = g.querySelector("button");
          ta.value = rec.g[i] || "";
          ta.addEventListener("input", function () { rec.g[i] = ta.value; put(); });
          b.addEventListener("click", function () {
            var open = ans.hidden; ans.hidden = !open; b.textContent = open ? "Скрыть ответ" : "Сверить";
            if (open && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event("change")); }
          });
          s.insertBefore(g, s.querySelector(".lab-text").nextSibling);
        }
      });
      upd();
    });
  }

  window.JC = { pages: PAGES, state: state };
  document.addEventListener("DOMContentLoaded", function () {
    current = document.body.getAttribute("data-page") || "00";
    buildSidebar(); decorateHead(); buildToc(); highlightAll(); initLabs(); buildFooter(); updateProgress();
  });
})();

/* ===== Интерактив: пошаговые симуляторы и тесты с выбором ответа (общий блок для всех пособий) =====
   Пошаговый симулятор:
     <div class="widget stepper"> … <section class="st-step" data-t="заголовок" data-hl="id1 id2" data-log="строка лога">…</section> …
     data-hl — id элементов, которые подсвечиваются на шаге (пройденные получают класс .was);
     data-from / data-to на любом элементе внутри виджета — элемент виден с шага N (с единицы) и скрывается с шага M.
   Тест:
     <div class="mcq" data-ok="1"><p>Вопрос</p><ul><li>…</li><li>…</li></ul><div class="why">Объяснение</div></div>
     data-ok — индекс верного варианта с нуля; счёт выводится в .mcq-score. */
(function () {
  "use strict";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  window.SG = window.SG || {};
  if (!window.SG.esc) window.SG.esc = esc;

  function initSteppers() {
    document.querySelectorAll(".stepper").forEach(function (w) {
      var steps = [].slice.call(w.querySelectorAll(".st-step"));
      if (!steps.length || w.querySelector(".st-body")) return;
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
      w.insertBefore(ctr, w.querySelector(".st-stage") || body);
      var log = null;
      if (steps.some(function (s) { return s.hasAttribute("data-log"); })) {
        log = document.createElement("div"); log.className = "log";
        body.parentNode.insertBefore(log, body.nextSibling);
      }
      var btn = function (a) { return ctr.querySelector('[data-a="' + a + '"]'); };
      var count = ctr.querySelector(".st-count");
      var cur = 0, timer = null;
      function ids(s) { return (s.getAttribute("data-hl") || "").split(/\s+/).filter(Boolean); }
      function go(i) {
        cur = Math.max(0, Math.min(steps.length - 1, i));
        w.querySelectorAll(".hl, .was").forEach(function (e) { e.classList.remove("hl", "was"); });
        steps.forEach(function (s, k) {
          s.hidden = k !== cur;
          list.children[k].className = k === cur ? "cur" : (k < cur ? "past" : "");
          if (k < cur) ids(s).forEach(function (id) { var e = document.getElementById(id); if (e) e.classList.add("was"); });
        });
        ids(steps[cur]).forEach(function (id) { var e = document.getElementById(id); if (e) { e.classList.remove("was"); e.classList.add("hl"); } });
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

  function initMcq() {
    var all = document.querySelectorAll(".mcq");
    if (!all.length) return;
    var right = 0, answered = 0, score = document.querySelector(".mcq-score");
    function upd() { if (score) score.textContent = answered ? "Верно " + right + " из " + answered + " · всего вопросов " + all.length : "Вопросов: " + all.length + ". Выберите ответ — появится объяснение."; }
    all.forEach(function (q) {
      if (q.querySelector(".mcq-opt")) return;
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

  document.addEventListener("DOMContentLoaded", function () { initSteppers(); initMcq(); });
})();
