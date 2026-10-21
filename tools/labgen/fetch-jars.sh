#!/usr/bin/env bash
# Скачивает в jars/ внешние артефакты, которые используют лабораторные (JOL, H2, JUnit, AssertJ, Mockito, Maven).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p jars && cd jars
B=https://repo1.maven.org/maven2
for u in \
  org/openjdk/jol/jol-cli/0.17/jol-cli-0.17-full.jar \
  com/h2database/h2/2.5.252/h2-2.5.252.jar \
  org/junit/platform/junit-platform-console-standalone/6.1.3/junit-platform-console-standalone-6.1.3.jar \
  org/assertj/assertj-core/3.27.7/assertj-core-3.27.7.jar \
  org/mockito/mockito-core/5.24.0/mockito-core-5.24.0.jar \
  net/bytebuddy/byte-buddy/1.17.7/byte-buddy-1.17.7.jar \
  net/bytebuddy/byte-buddy-agent/1.17.7/byte-buddy-agent-1.17.7.jar \
  org/objenesis/objenesis/3.3/objenesis-3.3.jar \
  org/apache/maven/apache-maven/3.9.16/apache-maven-3.9.16-bin.zip; do
  f=$(basename "$u")
  [ -f "$f" ] || curl -sfLO "$B/$u"
done
[ -d apache-maven-3.9.16 ] || unzip -q apache-maven-3.9.16-bin.zip
echo "jars готовы: $(pwd)"
