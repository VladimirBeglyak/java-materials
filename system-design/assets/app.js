/* System Design — навигация, прогресс, просмотр конспектов, подсветка кода. Работает и через file:// */
(function () {
  "use strict";

  var PAGES = [
    { id: "00", file: "index.html", title: "Карта курса", group: null },
    { id: "01", file: "01-foundations.html", title: "Основы: требования, масштаб, доступность", tier: "j", sk: "#1–4, #7", group: "Фундамент" },
    { id: "02", file: "02-cap-consistency.html", title: "CAP и модели согласованности", tier: "m", sk: "#5, #11", group: "Фундамент" },
    { id: "03", file: "03-traffic.html", title: "Балансировка, шлюзы и прокси", tier: "j", sk: "#8–10", group: "Трафик и API" },
    { id: "04", file: "04-api.html", title: "API и взаимодействие сервисов", tier: "m", sk: "#14, #16, #26, #34", group: "Трафик и API" },
    { id: "05", file: "05-security.html", title: "Аутентификация и авторизация", tier: "m", sk: "#23–25", group: "Трафик и API" },
    { id: "06", file: "06-databases.html", title: "Выбор базы данных", tier: "j", sk: "#6, #12", group: "Данные" },
    { id: "07", file: "07-transactions.html", title: "Транзакции и блокировки", tier: "m", sk: "#17, #27, #28", group: "Данные" },
    { id: "08", file: "08-db-scaling.html", title: "Масштабирование базы данных", tier: "s", sk: "#18–22", group: "Данные" },
    { id: "09", file: "09-caching.html", title: "Кэширование и Redis", tier: "m", sk: "#15, #39, #49", group: "Кэш и Redis" },
    { id: "10", file: "10-redis-ha.html", title: "Redis: надёжность и масштаб", tier: "s", sk: "#40–43", group: "Кэш и Redis" },
    { id: "11", file: "11-redis-toolkit.html", title: "Redis: инструменты", tier: "s", sk: "#44–48", group: "Кэш и Redis" },
    { id: "12", file: "12-kafka-core.html", title: "Очереди сообщений и Kafka", tier: "m", sk: "#13, #29–31", group: "Сообщения и Kafka" },
    { id: "13", file: "13-kafka-consumers.html", title: "Kafka: потребители", tier: "s", sk: "#32, #33, #36", group: "Сообщения и Kafka" },
    { id: "14", file: "14-kafka-reliability.html", title: "Kafka: гарантии и отказы", tier: "s", sk: "#35, #37, #38 + доп.", group: "Сообщения и Kafka" },
    { id: "15", file: "15-microservices.html", title: "Микросервисы", tier: "s", sk: "#50–53", group: "Архитектура" },
    { id: "16", file: "16-estimation.html", title: "Оценка нагрузки на салфетке", tier: "m", group: "Проектирование на практике" },
    { id: "17", file: "17-interview-framework.html", title: "Каркас решения задачи System Design", tier: "m", group: "Проектирование на практике" },
    { id: "18", file: "18-url-shortener.html", title: "Разбор: сократитель ссылок", tier: "m", group: "Проектирование на практике" },
    { id: "19", file: "19-news-feed.html", title: "Разбор: лента новостей", tier: "s", group: "Проектирование на практике" },
    { id: "20", file: "20-chat.html", title: "Разбор: мессенджер", tier: "s", group: "Проектирование на практике" },
    { id: "21", file: "21-payments.html", title: "Разбор: платёжная система", tier: "s", group: "Проектирование на практике" },
    { id: "22", file: "22-reliability-slo.html", title: "Надёжность: SLO, бюджет ошибок, инциденты", tier: "m", group: "Проектирование на практике" },
    { id: "23", file: "23-storage-search.html", title: "Файлы, CDN и полнотекстовый поиск", tier: "m", group: "Проектирование на практике" },
    { id: "24", file: "24-consensus.html", title: "Консенсус: кворум и Raft", tier: "s", group: "Проектирование на практике" }
  ];

  /* [номер, файл изображения без расширения, название, страница, якорь] */
  var SKETCHES = [
    ["1", "01-system-design", "System Design: общий план", "01", "what"],
    ["2", "02-functional-vs-nonfunctional", "Functional vs Non-Functional", "01", "requirements"],
    ["3", "03-scalability", "Vertical vs Horizontal Scaling", "01", "scaling"],
    ["4", "04-ha-vs-fault-tolerance", "High Availability vs Fault Tolerance", "01", "ha-ft"],
    ["5", "05-cap-theorem", "CAP Theorem", "02", "cap"],
    ["6", "06-sql-vs-nosql", "SQL vs NoSQL", "06", "sql-nosql"],
    ["7", "07-latency-vs-throughput", "Latency vs Throughput", "01", "latency"],
    ["8", "08-load-balancing", "Load Balancing", "03", "lb"],
    ["9", "09-lb-vs-api-gateway", "Load Balancer vs API Gateway", "03", "lb-vs-gw"],
    ["10", "10-reverse-vs-forward-proxy", "Reverse vs Forward Proxy", "03", "proxy"],
    ["11", "11-consistency-models", "Consistency Models", "02", "models"],
    ["12", "12-choosing-database", "Choosing the Right Database", "06", "choosing"],
    ["13", "13-message-queues", "Message Queues", "12", "mq"],
    ["14", "14-synchronous-communication", "Synchronous Communication", "04", "protocols"],
    ["15", "15-caching-strategy", "Caching Strategy", "09", "strategy"],
    ["16", "16-rest-api-best-practices", "REST API Best Practices", "04", "rest"],
    ["17", "17-acid", "ACID Properties", "07", "acid"],
    ["18", "18-replication-sql", "Replication in SQL", "08", "repl-sql"],
    ["19", "19-replication-nosql", "Replication in NoSQL", "08", "repl-nosql"],
    ["20", "20-sharding", "Database Sharding", "08", "sharding"],
    ["21", "21-partitioning", "Database Partitioning", "08", "partitioning"],
    ["22", "22-database-optimisation", "Database Optimisation", "08", "optimisation"],
    ["23", "23-authentication-authorization", "Authentication & Authorization", "05", "authn-authz"],
    ["24", "24-jwt", "JWT Token", "05", "jwt"],
    ["25", "25-oauth2", "OAuth 2.0", "05", "oauth"],
    ["26", "26-rate-limiting", "Rate Limiting", "04", "rate-limit"],
    ["27", "27-database-locking", "Database Locking", "07", "locking"],
    ["28", "28-optimistic-vs-pessimistic", "Optimistic vs Pessimistic Lock", "07", "optimistic"],
    ["29", "29-kafka", "Kafka", "12", "kafka"],
    ["30", "30-kafka-rf-vs-isr", "Replication Factor vs ISR", "12", "rf-isr"],
    ["31", "31-kafka-leader-election", "Leader Election in Kafka", "12", "leader"],
    ["32", "32-kafka-partition-assignment", "Partition Assignment", "13", "assignment"],
    ["33", "33-kafka-consumer-rebalancing", "Consumer Rebalancing", "13", "rebalance"],
    ["34", "34-idempotency-rest-api", "Idempotency in REST API", "04", "idempotency"],
    ["35", "35-kafka-exactly-once", "Exactly Once in Kafka", "14", "exactly-once"],
    ["36", "36-kafka-idempotency", "Idempotency in Kafka", "13", "idempotency"],
    ["37", "37-kafka-transactions", "Kafka Transactions", "14", "transactions"],
    ["38", "38-kafka-streams", "Kafka Streams", "14", "streams"],
    ["39", "39-redis", "Redis", "09", "redis"],
    ["40", "40-redis-cluster", "Redis Cluster", "10", "cluster"],
    ["41", "41-redis-sentinel", "Redis Sentinel", "10", "sentinel"],
    ["42", "42-redis-replication", "Redis Replication", "10", "replication"],
    ["43", "43-redis-persistence", "Redis Persistence", "10", "persistence"],
    ["44", "44-redis-pubsub", "Redis Pub/Sub", "11", "pubsub"],
    ["45", "45-redis-streams", "Redis Streams", "11", "streams"],
    ["46", "46-redis-lua", "Redis Lua Script", "11", "lua"],
    ["47", "47-redis-bloom-filter", "Redis Bloom Filter", "11", "bloom"],
    ["48", "48-redis-distributed-lock", "Redis Distributed Lock", "11", "lock"],
    ["49", "49-redis-cache-bottlenecks", "Redis Cache: Bottlenecks and Failures", "09", "failures"],
    ["50", "50-monolith-to-microservices", "Monolith to Microservices", "15", "migration"],
    ["51", "51-microservices-patterns", "Microservices Design Patterns", "15", "patterns"],
    ["52", "52-api-gateway", "Microservices API Gateway", "15", "gateway"],
    ["53", "53-service-discovery", "Service Discovery", "15", "discovery"],
    ["доп.", "54-kafka-failure-handling", "Kafka Failure Handling — Deep Dive", "14", "failures"]
  ];

  var TIER = { j: "Junior", m: "Middle", s: "Senior" };
  var KEY = "sd-guide-done-v1";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var state = load();
  var current = "00";

  /* ---------- Theme ---------- */
  try { var th = localStorage.getItem("sd-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("sd-theme", next); } catch (e) {}
  }

  /* ---------- Sidebar ---------- */
  function buildSidebar() {
    var aside = document.querySelector(".sidebar");
    if (!aside) return;
    var html = '<a class="hub-link" href="../index.html">← Все пособия</a>';
    html += '<a class="brand" href="index.html"><b>SYSTEM / DESIGN</b><span>Проектирование систем по конспектам</span></a>';
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
      '<label class="mark-done"><input type="checkbox" id="doneBox"><span><b>Тема изучена.</b> Я могу без подсказок ответить на вопросы для самопроверки и воспроизвести схемы конспектов на доске.</span></label>';
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

  /* ---------- Page header: tier + sketch numbers ---------- */
  function decorateHead() {
    var p = PAGES.find(function (x) { return x.id === current; });
    var meta = document.querySelector(".page-head .meta");
    if (p && p.tier && meta) {
      var s = document.createElement("span");
      s.className = "tag tier " + p.tier; s.textContent = TIER[p.tier];
      meta.insertBefore(s, meta.firstChild);
      if (p.sk) { var l = document.createElement("span"); l.className = "tag sk"; l.textContent = "Конспекты: " + p.sk; meta.insertBefore(l, s.nextSibling); }
    }
  }

  /* ---------- Sketch lightbox ---------- */
  function initLightbox() {
    var links = document.querySelectorAll("figure.sketch a");
    if (!links.length) return;
    var box = null;
    function close() { if (box) { box.remove(); box = null; document.body.classList.remove("lb-open"); } }
    function open(href, title) {
      close();
      box = document.createElement("div");
      box.className = "lightbox";
      box.innerHTML = '<div class="lb-bar"><span></span><span><button type="button" data-z>Масштаб</button> <button type="button" data-x>Закрыть · Esc</button></span></div><img alt="">';
      box.querySelector(".lb-bar span").textContent = title;
      var img = box.querySelector("img");
      img.src = href; img.alt = title;
      function zoom(e) { e.stopPropagation(); box.classList.toggle("zoomed"); }
      img.addEventListener("click", zoom);
      box.querySelector("[data-z]").addEventListener("click", zoom);
      box.querySelector(".lb-bar").addEventListener("click", function (e) { e.stopPropagation(); });
      box.querySelector("[data-x]").addEventListener("click", close);
      box.addEventListener("click", close);
      document.body.appendChild(box);
      document.body.classList.add("lb-open");
    }
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        var cap = a.parentNode.querySelector("figcaption b");
        open(a.getAttribute("href"), cap ? cap.parentNode.textContent.replace(/увеличить.*$/, "").trim() : "");
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- Index: gallery of all sketches ---------- */
  function buildGallery() {
    var holder = document.querySelector(".gallery[data-auto]");
    if (!holder) return;
    var byId = {};
    PAGES.forEach(function (p) { byId[p.id] = p; });
    holder.innerHTML = SKETCHES.map(function (s) {
      var page = byId[s[3]];
      return '<a href="' + page.file + "#" + s[4] + '" title="Тема ' + s[3] + " · " + page.title + '">' +
        '<img loading="lazy" src="img/thumb/' + s[1] + '.jpg" alt="' + s[2] + '">' +
        "<span><b>" + (/^\d+$/.test(s[0]) ? "#" + s[0] : s[0]) + "</b>" + s[2] + "</span></a>";
    }).join("");
  }

  /* ---------- Syntax highlight ---------- */
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
  /* sh / http / sql / redis / properties: комментарии (# и --), первое слово-команда */
  function hlText(src) {
    return src.split("\n").map(function (line) {
      var e = esc(line);
      if (/^\s*(#|--)/.test(line)) return '<span class="tk-com">' + e + "</span>";
      e = e.replace(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|HTTP\/[\d.]+)(\s)/, '<span class="tk-kw">$1</span>$2');
      e = e.replace(/^([A-Za-z][\w-]*:)(\s)/, '<span class="tk-type">$1</span>$2');
      e = e.replace(/(\s(?:#|--)\s.*)$/, '<span class="tk-com">$1</span>');
      return e;
    }).join("\n");
  }
  function highlightAll() {
    document.querySelectorAll("pre > code").forEach(function (el) {
      var raw = el.textContent.replace(/^\n/, "");
      if (el.classList.contains("java")) el.innerHTML = highlight(raw);
      else if (el.classList.contains("txt")) el.innerHTML = hlText(raw);
      var pre = el.parentNode;
      var b = document.createElement("button");
      b.className = "copy-btn"; b.type = "button"; b.textContent = "copy";
      b.addEventListener("click", function () {
        var done = function () { b.textContent = "✓"; setTimeout(function () { b.textContent = "copy"; }, 1200); };
        if (navigator.clipboard) navigator.clipboard.writeText(raw).then(done, function () {});
        else { var ta = document.createElement("textarea"); ta.value = raw; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
      });
      if (pre.hasAttribute("data-title")) b.style.top = "4px";
      pre.appendChild(b);
    });
  }

  /* ---------- Auto TOC from h2 ---------- */
  function buildToc() {
    var holder = document.querySelector(".toc[data-auto]");
    if (!holder) return;
    var hs = document.querySelectorAll(".content h2[id]");
    var html = "<strong>На этой странице</strong><ol>";
    hs.forEach(function (h) {
      var t = "";
      h.childNodes.forEach(function (n) { if (!(n.classList && (n.classList.contains("h-num") || n.classList.contains("sk-num")))) t += n.textContent; });
      html += '<li><a href="#' + h.id + '">' + esc(t.trim()) + "</a></li>";
    });
    holder.innerHTML = html + "</ol>";
  }

  window.SD = { pages: PAGES, sketches: SKETCHES, state: state };
  document.addEventListener("DOMContentLoaded", function () {
    current = document.body.getAttribute("data-page") || "00";
    buildSidebar(); decorateHead(); buildToc(); buildGallery(); highlightAll(); initLightbox(); buildFooter(); updateProgress();
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
