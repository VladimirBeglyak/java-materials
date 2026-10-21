# -*- coding: utf-8 -*-
import os
import re

SITE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

TPL = """<!-- lab-setup:start -->
<h2 id="lab-setup">Практикум: подготовка рабочего места</h2>
<p>В каждой главе перед самопроверкой есть раздел <b>«Практикум: пишем и запускаем»</b> — {n} лабораторных, где вы набираете код, запускаете его и смотрите, {what}. Ожидаемый вывод под каждой командой снят настоящим запуском на OpenJDK 25.0.2 (Windows x64, 18 логических процессоров, 32 ГБ): числа, адреса и времена у вас будут свои, а поведение — тем же.</p>

<h3>1. JDK и IDE</h3>
<ol class="steps">
  <li><b>JDK 25</b> (LTS): в IntelliJ IDEA — File → Project Structure → SDK → Add SDK → Download JDK → версия 25 (Oracle OpenJDK, Temurin или Corretto). Проверка в терминале: <code>java -version</code> и <code>javac -version</code> должны показать 25.</li>
  <li><b>Проект</b> <code>{proj}</code> (File → New → Project → Java, без системы сборки). Для каждой главы — свой модуль: File → New → Module → <code>ch01</code>, <code>ch02</code>… Классы кладите прямо в <code>src</code> (пакет по умолчанию): имена классов внутри главы не повторяются, а команды из пособия работают без пакетов.</li>
  <li><b>Language level</b> модуля — 25 (Project Structure → Modules → Language level), иначе новые возможности языка не скомпилируются.</li>
</ol>

<h3>2. Где в IDEA то, что в пособии написано командой</h3>
<div class="table-wrap"><table>
<tr><th>В пособии</th><th>В IntelliJ IDEA</th></tr>
<tr><td><code>java Hello</code></td><td>зелёный ▶ рядом с <code>main</code> (Ctrl+Shift+F10)</td></tr>
<tr><td><code>java -Xmx64m -Xlog:gc Hello</code></td><td>Run → Edit Configurations… → Modify options → <b>Add VM options</b> → <code>-Xmx64m -Xlog:gc</code></td></tr>
<tr><td><code>java Hello arg1 arg2</code></td><td>то же окно, поле <b>Program arguments</b></td></tr>
<tr><td><code>javap -c -p Hello</code></td><td>View → <b>Show Bytecode</b> (курсор в классе) или в терминале: <code>javap -c -p -cp out/production/ch01 Hello</code></td></tr>
<tr><td><code>jcmd</code>, <code>jfr</code>, <code>jshell</code></td><td>встроенный терминал Alt+F12 — инструменты JDK в нём доступны, если JDK в <code>PATH</code> (иначе — полный путь <code>%JAVA_HOME%\\bin\\jcmd</code>)</td></tr>
<tr><td><code>-cp lib/x.jar</code></td><td>File → Project Structure → Modules → Dependencies → + → JARs or Directories</td></tr>
</table></div>
<p>IDEA компилирует классы в <code>out/production/&lt;модуль&gt;</code>. Команды в пособии написаны так, будто вы стоите в каталоге с исходником: проще всего в терминале перейти в <code>src</code> модуля (<code>cd ch01/src</code>) и запускать <code>javac Hello.java</code> / <code>java Hello</code> там же — или однофайловым режимом <code>java Hello.java</code> без отдельной компиляции.</p>

<h3>3. Терминал: Windows и bash</h3>
<div class="table-wrap"><table>
<tr><th>Задача</th><th>PowerShell / cmd</th><th>bash (Linux, macOS, Git Bash)</th></tr>
<tr><td>отфильтровать вывод</td><td><code>… | findstr Metaspace</code></td><td><code>… | grep Metaspace</code></td></tr>
<tr><td>скачать файл</td><td><code>curl.exe -LO https://…</code> (в PowerShell <code>curl</code> без <code>.exe</code> — это другая команда)</td><td><code>curl -LO https://…</code></td></tr>
<tr><td>разделитель classpath</td><td><code>-cp "lib/*;."</code></td><td><code>-cp "lib/*:."</code></td></tr>
<tr><td>две команды подряд</td><td>по одной в строке (в PowerShell 5 нет <code>&amp;&amp;</code>)</td><td><code>javac A.java &amp;&amp; java A</code></td></tr>
</table></div>

<h3>4. Как проходить лабораторную</h3>
<ol class="steps">
  <li>Наберите код руками (кнопки copy можно скрыть переключателем «набираю руками» в начале практикума).</li>
  <li>На шагах со знаком <b>?</b> сначала запишите прогноз в поле — он сохраняется в браузере, — затем запустите и нажмите «Сверить».</li>
  <li>Сравните свой вывод с образцом под спойлером «Вывод». Если отличается не только числами — это повод разобраться, а не пропустить.</li>
  <li>Блок «Поэкспериментируйте» — главное: меняйте по одной детали и предсказывайте результат. Ответы спрятаны под стрелками.</li>
  <li>Отмечайте шаги галочкой «сделал» — прогресс лабораторной виден в её заголовке.</li>
</ol>
<!-- lab-setup:end -->
"""


def apply(guide, before, n, what, proj):
    p = os.path.join(SITE, guide, "index.html")
    s = open(p, encoding="utf-8").read()
    s = re.sub(r"<!-- lab-setup:start -->.*?<!-- lab-setup:end -->\n\n?", "", s, flags=re.S)
    frag = TPL.format(n=n, what=what, proj=proj)
    i = s.index('<h2 id="%s">' % before)
    s = s[:i] + frag + "\n" + s[i:]
    open(p, "w", encoding="utf-8", newline="\n").write(s)
    print("ok", p)


apply("jvm", "sources", "около ста", "как JVM загружает классы, раскладывает объекты, собирает мусор и компилирует код: javap, -Xlog, jcmd, JFR, JOL", "jvm-lab")
apply("java-core", "related", "более сотни", "как ведёт себя язык и стандартная библиотека — от передачи параметров и пула строк до HashMap, стримов, JDBC и тестов", "java-core-lab")
