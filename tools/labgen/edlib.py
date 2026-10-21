# -*- coding: utf-8 -*-
import sys


def ed(p, pairs):
    s = open(p, encoding='utf-8').read()
    ok = True
    for a, b in pairs:
        if a not in s:
            print("MISS", p, a[:80])
            ok = False
            continue
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s)
    return ok


if __name__ == "__main__":
    exec(open(sys.argv[1], encoding='utf-8').read())
