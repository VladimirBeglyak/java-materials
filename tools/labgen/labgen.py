# -*- coding: utf-8 -*-
"""Генератор раздела «Практикум» для глав пособий.

Спецификация главы (labs/<guide>/<NN>.lab):
  @chapter <NN> | <anchor-id-before-which-to-insert>
  @intro
  html…
  @end
  @lab <num> | <title> | <time>
  @goal
  html…
  @end
  @step html (одной строкой)
  @file <path>            -> содержимое до @end, пишется в рабочий каталог лабы и показывается
  @run [opts]             -> команды до @end (по одной в строке), исполняются bash'ем, показываются
       opts: noout | grep=REGEX | head=N | tail=N | timeout=S | fail (не ругаться на код возврата) | title=…
  @exec                   -> команды до @end, исполняются, не показываются
  @output                 -> показанный вывод, заданный вручную (до @end)
  @predict html           -> вопрос с полем для предсказания; ответ — блок @answer … @end
  @note html              -> абзац внутри шага
  @try                    -> список экспериментов: строки до @end, каждая — пункт; «Q ::: A» — с ответом
  @html                   -> произвольный html до @end
"""
import hashlib, html, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
RUN = os.path.join(ROOT, "run")
CACHE_F = os.path.join(ROOT, "cache.json")
SITE = os.path.dirname(os.path.dirname(ROOT))          # корень visuals/
BASH = os.environ.get("LABGEN_BASH") or r"C:\Program Files\Git\bin\bash.exe"
if not os.path.exists(BASH):
    BASH = shutil.which("bash") or "bash"
JDK = "JDK 25.0.2"

cache = json.load(open(CACHE_F, encoding="utf-8")) if os.path.exists(CACHE_F) else {}
fails = []
USE_CACHE = [True]
REVIEW = []


def esc(s):
    return html.escape(s, quote=False)


def sanitize(out, wd):
    variants = {wd, wd.replace("\\", "/")}
    m = re.match(r"^([A-Za-z]):[\\/](.*)$", wd)
    if m:
        variants.add("/" + m.group(1).lower() + "/" + m.group(2).replace("\\", "/"))
    out = out.replace("file:/" + wd.replace("\\", "/") + "/", "file:/C:/lab/")
    for v in sorted(variants, key=len, reverse=True):
        out = out.replace(v + "\\", "").replace(v + "/", "").replace(v, ".")
    out = re.sub(r"NOTE: Picked up JDK_JAVA_OPTIONS:[^\n]*\n", "", out)
    out = out.replace("-Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 ", "")
    out = out.replace("Vladimir Beglyak", "user").replace("VLADIMIR", "HOST")
    out = re.sub(r"C:\\Users\\user\\.jdks\\openjdk-25.0.2", r"C:\\jdk-25", out)
    out = re.sub(r"/c/Users/user/.jdks/openjdk-25.0.2", "/opt/jdk-25", out)
    return out


def run_block(cmds, wd, opts, key_extra):
    key = hashlib.sha1(("\n".join(cmds) + "|" + key_extra + "|" + json.dumps(opts, sort_keys=True)).encode()).hexdigest()
    if key in cache and USE_CACHE[0]:
        return cache[key]
    ex = []
    for c in cmds:
        if " ||| " in c:
            c = c.split(" ||| ", 1)[1]
        elif c.lstrip().startswith("#!"):
            c = c.lstrip()[2:]
        ex.append(c)
    script = "set -o pipefail\nunset JAVA_TOOL_OPTIONS\nexport JDK_JAVA_OPTIONS=\"-Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8\"\n" +"\n".join(ex) + "\n"
    try:
        p = subprocess.run([BASH, "-lc", script], cwd=wd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=int(opts.get("timeout", 120)))
        out = p.stdout.decode("utf-8", "replace")
        code = p.returncode
    except subprocess.TimeoutExpired as e:
        out = (e.stdout or b"").decode("utf-8", "replace") + "\n[timeout]"
        code = -1
    out = sanitize(out.replace("\r\n", "\n").replace("\r", ""), wd)
    res = {"out": out, "code": code}
    cache[key] = res
    return res


def shape(out, opts):
    lines = out.rstrip("\n").split("\n")
    if "grep" in opts:
        r = re.compile(opts["grep"])
        lines = [l for l in lines if r.search(l)]
    cut = False
    if "head" in opts and len(lines) > int(opts["head"]):
        lines = lines[: int(opts["head"])]; cut = True
    if "tail" in opts and len(lines) > int(opts["tail"]):
        lines = lines[-int(opts["tail"]):]; cut = True
    s = "\n".join(lines)
    if cut:
        s += "\n…"
    return s


def parse_opts(s):
    o = {}
    for t in re.findall(r'(\w+)=("[^"]*"|\S+)|(\w+)', s):
        if t[2]:
            o[t[2]] = True
        else:
            o[t[0]] = t[1].strip('"')
    return o


def gen(guide, spec_path):
    src = open(spec_path, encoding="utf-8").read().replace("\r\n", "\n").split("\n")
    i = 0
    chapter = anchor = None
    intro = ""
    labs = []
    cur = None

    def block():
        nonlocal i
        buf = []
        i += 1
        while i < len(src) and src[i].rstrip() != "@end":
            buf.append(src[i]); i += 1
        return "\n".join(buf)

    while i < len(src):
        line = src[i]
        if cur is not None and re.match(r"@(ide|note|run|exec|output|html)", line) and not cur["steps"]:
            cur["steps"].append({"kind": "step", "html": "", "items": []})
        if line.startswith("@chapter"):
            chapter, anchor = [x.strip() for x in line[8:].split("|")]
        elif line.startswith("@intro"):
            intro = block()
        elif line.startswith("@lab"):
            num, title, tm = [x.strip() for x in line[4:].split("|")]
            cur = {"num": num, "title": title, "time": tm, "goal": "", "steps": [], "try": []}
            labs.append(cur)
        elif line.startswith("@goal"):
            cur["goal"] = block()
        elif line.startswith("@step"):
            cur["steps"].append({"kind": "step", "html": line[5:].strip(), "items": []})
        elif line.startswith("@file"):
            if not cur["steps"]:
                cur["steps"].append({"kind": "step", "html": "Создайте файл <code>%s</code>:" % esc(line[5:].strip()), "items": []})
            cur["steps"][-1]["items"].append(("file", line[5:].strip(), block()))
        elif line.startswith("@run"):
            cur["steps"][-1]["items"].append(("run", parse_opts(line[4:]), block()))
        elif line.startswith("@exec"):
            cur["steps"][-1]["items"].append(("exec", parse_opts(line[5:]), block()))
        elif line.startswith("@output"):
            o = parse_opts(line[7:])
            cur["steps"][-1]["items"].append(("output", o, block()))
        elif re.match(r"@(ide|note|run|exec|output|html)", line) and not cur["steps"]:
            cur["steps"].append({"kind": "step", "html": "", "items": []})
            continue
        elif line.startswith("@ide"):
            cur["steps"][-1]["items"].append(("ide", line[4:].strip(), None))
        elif line.startswith("@note"):
            cur["steps"][-1]["items"].append(("note", line[5:].strip(), None))
        elif line.startswith("@html"):
            cur["steps"][-1]["items"].append(("html", block(), None))
        elif line.startswith("@predict"):
            cur["steps"].append({"kind": "predict", "html": line[8:].strip(), "items": []})
        elif line.startswith("@answer"):
            cur["steps"][-1]["answer"] = block()
        elif line.startswith("@try"):
            cur["try"] = [l for l in block().split("\n") if l.strip()]
        elif line.strip() == "@end":
            pass
        elif line.strip() and not line.startswith("#"):
            raise SystemExit("%s:%d: непонятная строка: %s" % (spec_path, i + 1, line))
        i += 1

    out = ['<!-- hands-on:start -->', '<h2 id="hands-on"><span class="h-num">0</span>Практикум: пишем и запускаем</h2>']
    out.append('<div class="lab-intro">' + (intro or "") +
               '<p class="lab-how">Код набирайте руками — так он запоминается. Перед запуском запишите предсказание в поле «Ваш прогноз», затем сверьтесь с реальным выводом (снят на ' + JDK +
               '; адреса, времена и хэши у вас будут другими). Как подготовить окружение — на <a href="index.html#lab-setup">странице курса</a>.</p></div>')
    wd = os.path.join(RUN, guide, chapter)
    if os.path.isdir(wd):
        shutil.rmtree(wd, ignore_errors=True)
    os.makedirs(wd, exist_ok=True)
    spec_hash = hashlib.sha1("\n".join(src).encode()).hexdigest()
    USE_CACHE[0] = cache.get("spec:" + guide + chapter) == spec_hash and "--fresh" not in sys.argv
    cache["spec:" + guide + chapter] = spec_hash
    files_sig = ""
    for lab in labs:
        lid = guide + "-" + lab["num"]
        h = ['<div class="lab" data-lab="%s">' % lid,
             '<div class="lab-head"><span class="lab-num">Лаба %s</span><b>%s</b><span class="lab-time">%s</span><span class="lab-prog"></span></div>' % (lab["num"], lab["title"], lab["time"])]
        if lab["goal"]:
            h.append('<div class="lab-goal">%s</div>' % lab["goal"])
        h.append('<ol class="lab-steps">')
        for st in lab["steps"]:
            cls = "lab-step" + (" predict" if st["kind"] == "predict" else "")
            h.append('<li class="%s"><div class="lab-text">%s</div>' % (cls, st["html"]))
            for kind, a, b in st["items"]:
                if kind == "file":
                    fp = os.path.join(wd, a)
                    os.makedirs(os.path.dirname(fp), exist_ok=True)
                    with open(fp, "w", encoding="utf-8", newline="\n") as f:
                        f.write(b.rstrip("\n") + "\n")
                    files_sig += a + "\0" + b + "\0"
                    cls_code = "txt" if not a.endswith(".java") else "java"
                    if a.endswith((".xml", ".gradle", ".kts", ".properties", ".yml", ".yaml", ".sql", ".MF", ".txt", ".sh", ".json")):
                        cls_code = "txt"
                    h.append('<pre data-title="%s"><code class="%s">%s</code></pre>' % (esc(a), cls_code, esc(b.rstrip("\n"))))
                elif kind in ("run", "exec"):
                    cmds = [c for c in b.split("\n") if c.strip()]
                    res = run_block(cmds, wd, a, files_sig)
                    REVIEW.append("### %s [%s] code=%s\n$ %s\n%s" % (lab["num"], kind, res["code"], "\n$ ".join(cmds), shape(res["out"], a) if kind == "run" else res["out"][-800:]))
                    files_sig += "\0" + res["out"]
                    if res["code"] != 0 and not a.get("fail"):
                        fails.append("%s %s: код %s\n$ %s\n%s" % (guide, lab["num"], res["code"], "\n$ ".join(cmds), res["out"][-1500:]))
                    if kind == "run":
                        shown = "\n".join(c.split(" ||| ", 1)[0] for c in cmds if not c.lstrip().startswith("#!"))
                        if shown.strip():
                            h.append('<pre class="cmd" data-title="%s"><code class="txt">%s</code></pre>' % (esc(a.get("title", "терминал")), esc(shown)))
                        if not a.get("noout"):
                            o = shape(res["out"], a)
                            if o.strip():
                                h.append('<details class="lab-out"%s><summary>Вывод (%s)</summary><pre><code class="txt">%s</code></pre></details>' % (" open" if a.get("open") else "", JDK, esc(o)))
                elif kind == "output":
                    h.append('<details class="lab-out"><summary>%s</summary><pre><code class="txt">%s</code></pre></details>' % (esc(a.get("title", "Ожидаемый вывод")), esc(b)))
                elif kind == "ide":
                    h.append('<p class="lab-ide"><span>IDEA</span>%s</p>' % a)
                elif kind == "note":
                    h.append('<p class="lab-note">%s</p>' % a)
                elif kind == "html":
                    h.append(a)
            if st["kind"] == "predict":
                h.append('<div class="lab-ans" hidden>%s</div>' % st.get("answer", ""))
            h.append("</li>")
        h.append("</ol>")
        if lab["try"]:
            h.append('<div class="lab-try"><b>Поэкспериментируйте</b><ul>')
            for t in lab["try"]:
                if ":::" in t:
                    q, ans = t.split(":::", 1)
                    h.append('<li><details><summary>%s</summary><div>%s</div></details></li>' % (q.strip(), ans.strip()))
                else:
                    h.append("<li>%s</li>" % t.strip())
            h.append("</ul></div>")
        h.append("</div>")
        out.append("\n".join(h))
    out.append("<!-- hands-on:end -->")
    return chapter, anchor, "\n".join(out) + "\n"


def insert(guide, chapter, anchor, frag):
    files = [f for f in os.listdir(os.path.join(SITE, guide)) if f.startswith(chapter + "-")]
    path = os.path.join(SITE, guide, files[0])
    s = open(path, encoding="utf-8").read()
    s = re.sub(r"<!-- hands-on:start -->.*?<!-- hands-on:end -->\n", "", s, flags=re.S)
    pos = s.find('<h2 id="%s">' % anchor)
    if pos < 0:
        raise SystemExit("нет якоря %s в %s" % (anchor, path))
    s = s[:pos] + frag + "\n" + s[pos:]
    n = [0]
    ch = str(int(chapter))

    def ren(m):
        n[0] += 1
        return '<span class="h-num">%s.%d</span>' % (ch, n[0])
    s = re.sub(r'<span class="h-num">[^<]*</span>', ren, s)
    if '<span class="tag">практикум</span>' not in s:
        s = s.replace('</div>\n</header>', '<span class="tag">практикум</span></div>\n</header>', 1)
    open(path, "w", encoding="utf-8", newline="\n").write(s)
    return path


if __name__ == "__main__":
    targets = [a for a in sys.argv[1:] if not a.startswith("--")]
    for t in targets:
        guide, num = t.split("/")
        spec = os.path.join(ROOT, "labs", guide, num + ".lab")
        chapter, anchor, frag = gen(guide, spec)
        os.makedirs(os.path.join(ROOT, "review"), exist_ok=True)
        open(os.path.join(ROOT, "review", guide + "-" + num + ".txt"), "w", encoding="utf-8").write("\n\n".join(REVIEW))
        del REVIEW[:]
        if "--dry" not in sys.argv:
            print("ok", insert(guide, chapter, anchor, frag))
        json.dump(cache, open(CACHE_F, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    if fails:
        print("\n==== ОШИБКИ ====")
        print("\n\n".join(fails))
