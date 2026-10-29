/* SQL — навигация, прогресс, подсветка кода, пошаговые симуляторы, тесты, SQL-песочница. Работает и через file:// */
(function () {
  "use strict";

  var PAGES = [
    { id: "00", file: "index.html", title: "Карта курса", group: null },
    { id: "01", file: "01-select.html", title: "SELECT: выборка и реляционная модель", tier: "j", group: "Основы запросов" },
    { id: "02", file: "02-filter.html", title: "WHERE: фильтрация и NULL", tier: "j", group: "Основы запросов" },
    { id: "03", file: "03-order-limit.html", title: "Сортировка, DISTINCT, LIMIT", tier: "j", group: "Основы запросов" },
    { id: "04", file: "04-expressions.html", title: "Выражения и функции: строки, числа, даты", tier: "j", group: "Основы запросов" },
    { id: "05", file: "05-aggregation.html", title: "Агрегация: GROUP BY и HAVING", tier: "m", group: "Основы запросов" },
    { id: "06", file: "06-joins.html", title: "JOIN: все виды соединений", tier: "m", group: "Соединения и подзапросы" },
    { id: "07", file: "07-subqueries.html", title: "Подзапросы: скалярные, IN, EXISTS", tier: "m", group: "Соединения и подзапросы" },
    { id: "08", file: "08-set-ops.html", title: "UNION, INTERSECT, EXCEPT", tier: "m", group: "Соединения и подзапросы" },
    { id: "09", file: "09-cte.html", title: "CTE и рекурсивные запросы", tier: "m", group: "Соединения и подзапросы" },
    { id: "10", file: "10-window.html", title: "Оконные функции", tier: "m", group: "Соединения и подзапросы" },
    { id: "11", file: "11-dml.html", title: "INSERT, UPDATE, DELETE, RETURNING", tier: "j", group: "Изменение данных" },
    { id: "12", file: "12-upsert.html", title: "UPSERT, MERGE и массовые операции", tier: "m", group: "Изменение данных" },
    { id: "13", file: "13-datetime.html", title: "Дата и время", tier: "m", group: "Типы данных" },
    { id: "14", file: "14-text.html", title: "Текст: строки, LIKE, регулярные выражения", tier: "m", group: "Типы данных" },
    { id: "15", file: "15-json.html", title: "JSON и полуструктурированные данные", tier: "m", group: "Типы данных" },
    { id: "16", file: "16-transactions.html", title: "Транзакции: BEGIN, COMMIT, ROLLBACK", tier: "m", group: "Транзакции и производительность" },
    { id: "17", file: "17-indexes.html", title: "Индексы и скорость: EXPLAIN", tier: "m", group: "Транзакции и производительность" },
    { id: "18", file: "18-complex.html", title: "Сложные запросы: разбор задач", tier: "s", group: "Практика" },
    { id: "19", file: "19-pitfalls.html", title: "Ловушки и антипаттерны SQL", tier: "m", group: "Практика" },
    { id: "20", file: "20-practice.html", title: "Практикум и собеседование", tier: "s", group: "Практика" }
  ];
  var TIER = { j: "Junior", m: "Middle", s: "Senior" };
  var KEY = "sql-guide-done-v1";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var state = load();
  var current = "00";

  /* ---------- Theme ---------- */
  try { var th = localStorage.getItem("sql-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("sql-theme", next); } catch (e) {}
  }

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    var aside = document.querySelector(".sidebar");
    if (!aside) return;
    var html = '<a class="hub-link" href="../index.html">← Все пособия</a>';
    html += '<a class="brand" href="index.html"><b>SQL / QUERIES</b><span>Написание любых запросов</span></a>';
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
      '<label class="mark-done"><input type="checkbox" id="doneBox"><span><b>Тема изучена.</b> Я могу написать любой разобранный здесь запрос сам, без подсказок, и объяснить, почему он вернёт именно такой результат.</span></label>';
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

  var SQLKW = "select from where and or not in is null as join inner left right full outer cross on using group by order having limit offset fetch first rows only distinct union all intersect except insert into values update set delete returning create table index unique primary key foreign references check constraint default alter add drop column rename to if exists cascade begin commit rollback savepoint transaction isolation level read committed repeatable serializable for share nowait skip locked with recursive case when then else end over partition window asc desc nulls last explain analyze buffers vacuum full concurrently grant revoke on schema view materialized refresh trigger function returns language plpgsql do lateral filter within exists between like ilike similar any some cast true false varchar text integer int bigint smallint numeric decimal boolean timestamptz timestamp date jsonb json uuid serial bigserial generated always identity stored include tablespace using gin gist brin hash btree lock mode access exclusive conflict nothing upsert replace analyze";
  var sqlKwRe = new RegExp("^(" + SQLKW.split(" ").join("|") + ")$", "i");
  var sqlTokRe = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:''|[^'])*')|(\$\d+|:[A-Za-z_]\w*|\?)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_][\w]*)\b/g;
  function highlightSql(src) {
    var out = "", last = 0, m; sqlTokRe.lastIndex = 0;
    while ((m = sqlTokRe.exec(src))) {
      out += esc(src.slice(last, m.index)); var t = m[0];
      if (m[1]) out += '<span class="tk-com">' + esc(t) + "</span>";
      else if (m[2]) out += '<span class="tk-str">' + esc(t) + "</span>";
      else if (m[3]) out += '<span class="tk-ann">' + esc(t) + "</span>";
      else if (m[4]) out += '<span class="tk-num">' + esc(t) + "</span>";
      else if (sqlKwRe.test(t)) out += '<span class="tk-kw">' + esc(t) + "</span>";
      else out += esc(t);
      last = m.index + t.length;
    }
    return out + esc(src.slice(last));
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
      else if (el.classList.contains("sql")) el.innerHTML = highlightSql(raw);
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

/* ===== SQL-песочница на sql.js (SQLite, скомпилированный в WebAssembly) =====
   <div class="sqlbox" data-schema="id-скрипта-со-схемой">
     <div class="sql-presets"><button data-sql="SELECT …">подпись</button>…</div>
     <textarea>SELECT …</textarea>
   </div>
   <script type="text/plain" id="id-скрипта-со-схемой">CREATE TABLE …; INSERT …;</script>
   База создаётся заново при первом запуске и по кнопке «Сбросить». Нужен интернет: библиотека грузится с jsDelivr. */
(function () {
  "use strict";
  var VER = "1.10.3", BASE = "https://cdn.jsdelivr.net/npm/sql.js@" + VER + "/dist/", loading = null;
  function loadSql() {
    if (loading) return loading;
    loading = new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = BASE + "sql-wasm.js";
      s.onload = function () { window.initSqlJs({ locateFile: function (f) { return BASE + f; } }).then(res, rej); };
      s.onerror = function () { loading = null; rej(new Error("Не удалось загрузить sql.js — нужен доступ к cdn.jsdelivr.net")); };
      document.head.appendChild(s);
    });
    return loading;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function table(r) {
    var h = '<div class="table-wrap"><table><tr>' + r.columns.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>";
    r.values.slice(0, 200).forEach(function (row) { h += "<tr>" + row.map(function (v) { return "<td>" + (v === null ? '<span class="sql-null">NULL</span>' : esc(v)) + "</td>"; }).join("") + "</tr>"; });
    h += "</table></div>";
    if (r.values.length > 200) h += '<div class="hint">показаны первые 200 строк из ' + r.values.length + "</div>";
    return h;
  }
  function init(box) {
    var ta = box.querySelector("textarea"), schemaEl = document.getElementById(box.getAttribute("data-schema"));
    var schema = schemaEl ? schemaEl.textContent : "";
    var bar = document.createElement("div"); bar.className = "controls";
    bar.innerHTML = '<button class="btn primary" type="button" data-a="run">▶ Выполнить (Ctrl+Enter)</button><button class="btn" type="button" data-a="reset">↺ Сбросить базу</button><button class="btn" type="button" data-a="schema">Показать схему</button><span class="st-count" data-a="status"></span>';
    ta.parentNode.insertBefore(bar, ta.nextSibling);
    var out = document.createElement("div"); out.className = "sql-out"; bar.parentNode.insertBefore(out, bar.nextSibling);
    ta.setAttribute("spellcheck", "false");
    var db = null, status = bar.querySelector('[data-a="status"]');
    function ensure() { return loadSql().then(function (SQL) { if (!db) { db = new SQL.Database(); if (schema) db.run(schema); } return db; }); }
    function run() {
      status.textContent = db ? "" : "загрузка SQLite…";
      ensure().then(function (d) {
        var t0 = performance.now(), res, before = d.exec("SELECT total_changes()")[0].values[0][0];
        try { res = d.exec(ta.value); }
        catch (e) { out.innerHTML = '<div class="verdict bad">Ошибка: ' + esc(e.message) + "</div>"; status.textContent = ""; return; }
        var ms = (performance.now() - t0).toFixed(1), ch = d.exec("SELECT total_changes()")[0].values[0][0] - before;
        out.innerHTML = res.length ? res.map(table).join("") : '<div class="verdict ' + (ch ? "ok" : "warn") + '">' + (ch ? "Выполнено. Изменено строк: " + ch : "Выполнено. Запрос не вернул ни одной строки.") + "</div>";
        status.textContent = ms + " мс";
      }, function (e) { out.innerHTML = '<div class="verdict bad">' + esc(e.message) + "</div>"; status.textContent = ""; });
    }
    bar.querySelector('[data-a="run"]').addEventListener("click", run);
    bar.querySelector('[data-a="reset"]').addEventListener("click", function () { if (db) { db.close(); db = null; } out.innerHTML = '<div class="verdict ok">База будет создана заново при следующем запуске.</div>'; });
    bar.querySelector('[data-a="schema"]').addEventListener("click", function () { out.innerHTML = '<pre class="sql-schema">' + esc(schema.trim()) + "</pre>"; });
    ta.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); } });
    box.querySelectorAll("[data-sql]").forEach(function (b) { b.addEventListener("click", function () { ta.value = b.getAttribute("data-sql"); run(); }); });
  }
  document.addEventListener("DOMContentLoaded", function () { document.querySelectorAll(".sqlbox").forEach(init); });
})();
