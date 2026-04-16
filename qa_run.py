"""
HDA Website QA Run — Terminal Visual Script
"""
import re, time, sys, urllib.request
from pathlib import Path

BASE  = Path(__file__).parent.resolve()
PAGES = ["index.html", "coaching.html", "course.html", "mentorship.html", "architecture.html", "privacy-policy.html"]

RESET  = "\033[0m"
BOLD   = "\033[1m"
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
DIM    = "\033[2m"
WHITE  = "\033[97m"

def p(text="", delay=0.02):
    print(text)
    time.sleep(delay)

def banner():
    p()
    p(f"{BOLD}{CYAN}{'━'*62}{RESET}")
    p(f"{BOLD}{CYAN}  🔍  HDA WEBSITE — FULL QA RUN{RESET}")
    p(f"{BOLD}{CYAN}{'━'*62}{RESET}")
    p(f"{DIM}  Project: /Desktop/Projects/hda{RESET}")
    p(f"{DIM}  Pages  : {len(PAGES)} HTML files{RESET}")
    p(f"{DIM}  Date   : 2026-04-16{RESET}")
    p(f"{BOLD}{CYAN}{'━'*62}{RESET}")
    p()
    time.sleep(0.5)

passes = []; fails = []; warns = []

def log(status, category, page, detail):
    if status == "PASS":
        icon = f"{GREEN}✅ PASS{RESET}"
        passes.append((category, page, detail))
    elif status == "FAIL":
        icon = f"{RED}❌ FAIL{RESET}"
        fails.append((category, page, detail))
    else:
        icon = f"{YELLOW}⚠️  WARN{RESET}"
        warns.append((category, page, detail))
    print(f"  {icon}  {DIM}[{category:18s}]{RESET}  {WHITE}{page:22s}{RESET}  {detail}")
    time.sleep(0.04)

def section(title):
    p()
    p(f"{BOLD}{CYAN}── {title} {'─'*(55-len(title))}{RESET}")
    time.sleep(0.1)

banner()

# ── 1. File existence ────────────────────────────────────────────────────────
section("1 / 8  FILE EXISTS")
for pg in PAGES:
    path = BASE / pg
    if path.exists():
        log("PASS", "FILE EXISTS", pg, f"{path.stat().st_size:,} bytes")
    else:
        log("FAIL", "FILE EXISTS", pg, "NOT FOUND")

# ── 2. Local images ──────────────────────────────────────────────────────────
section("2 / 8  LOCAL IMAGES")
img_pat = re.compile(r'src=["\'](?!http)(images/[^"\'?#]+)["\']')
for pg in PAGES:
    html = (BASE / pg).read_text(errors='ignore')
    imgs = sorted(set(img_pat.findall(html)))
    if not imgs:
        p(f"  {DIM}  [LOCAL IMAGE      ]  {pg:22s}  (no local images){RESET}")
        continue
    for img in imgs:
        if (BASE / img).exists():
            log("PASS", "LOCAL IMAGE", pg, img)
        else:
            log("FAIL", "LOCAL IMAGE", pg, f"MISSING — {img}")

# ── 3. External image URLs ───────────────────────────────────────────────────
section("3 / 8  EXTERNAL IMAGE URLs")
ext_src = re.compile(r'src=["\'](https?://[^"\']+)["\']')
CDN_SKIP = ('emailjs','fonts.g','gtag','jsdelivr','google')
for pg in PAGES:
    html = (BASE / pg).read_text(errors='ignore')
    urls = [u for u in set(ext_src.findall(html)) if not any(s in u for s in CDN_SKIP)]
    if not urls:
        p(f"  {DIM}  [EXT IMAGE        ]  {pg:22s}  (none){RESET}")
        continue
    for url in urls:
        try:
            req  = urllib.request.Request(url[:300], method='HEAD', headers={'User-Agent':'Mozilla/5.0'})
            code = urllib.request.urlopen(req, timeout=6).getcode()
            log("PASS" if code==200 else "FAIL", "EXT IMAGE", pg, f"HTTP {code} — {url[:60]}")
        except Exception as e:
            log("FAIL", "EXT IMAGE", pg, f"{str(e)[:45]} — {url[:50]}")

# ── 4. Internal links ────────────────────────────────────────────────────────
section("4 / 8  INTERNAL LINKS")
href_pat = re.compile(r'href=["\'](?!http|#|mailto|tel|javascript|data:)([^"\']+)["\']')
for pg in PAGES:
    html = (BASE / pg).read_text(errors='ignore')
    for href in sorted(set(href_pat.findall(html))):
        target = href.split('#')[0]
        if not target: continue
        if (BASE / target).exists():
            log("PASS", "INTERNAL LINK", pg, href)
        else:
            log("FAIL", "BROKEN LINK", pg, href)

# ── 5. Meta tags ─────────────────────────────────────────────────────────────
section("5 / 8  META TAGS")
for pg in PAGES:
    html = (BASE / pg).read_text(errors='ignore')
    for check, label in [
        ('name="viewport"',    'viewport'),
        ('name="description"', 'meta description'),
        ('rel="canonical"',    'canonical'),
        ('<title>',            'title tag'),
    ]:
        if check in html:
            log("PASS", "META", pg, label)
        else:
            log("WARN", "META", pg, f"missing {label}")

# ── 6. CSS / JS assets ───────────────────────────────────────────────────────
section("6 / 8  CSS / JS ASSETS")
for pg in PAGES:
    html = (BASE / pg).read_text(errors='ignore')
    if 'architecture' in pg:
        p(f"  {DIM}  [ASSET            ]  {pg:22s}  (inline styles — skip){RESET}")
        continue
    for asset in ['css/style.css', 'js/main.js']:
        if asset in html and (BASE / asset).exists():
            log("PASS", "ASSET", pg, asset)
        elif asset not in html:
            log("FAIL", "ASSET NOT LINKED", pg, asset)
        else:
            log("FAIL", "ASSET MISSING", pg, asset)

# ── 7. Alt text ───────────────────────────────────────────────────────────────
section("7 / 8  ALT TEXT (ACCESSIBILITY)")
img_tag = re.compile(r'<img([^>]*)>', re.I)
for pg in PAGES:
    html = (BASE / pg).read_text(errors='ignore')
    all_imgs   = img_tag.findall(html)
    no_alt     = [i for i in all_imgs if 'alt=' not in i]
    if no_alt:
        log("WARN", "ALT TEXT", pg, f"{len(no_alt)} image(s) missing alt")
    elif all_imgs:
        log("PASS", "ALT TEXT", pg, f"all {len(all_imgs)} images have alt")
    else:
        p(f"  {DIM}  [ALT TEXT         ]  {pg:22s}  (no images){RESET}")

# ── 8. Stale refs + bad paths ─────────────────────────────────────────────────
section("8 / 8  STALE REFS & PATH SAFETY")
for pg in PAGES:
    html = (BASE / pg).read_text(errors='ignore')
    # stale education.html hrefs
    if re.search(r'href=["\'][^"\']*education\.html', html):
        log("FAIL", "STALE LINK", pg, "href pointing to education.html")
    else:
        log("PASS", "STALE LINK", pg, "no stale education.html hrefs")
    # space/apostrophe in img src
    if "HimangshuDa Images" in html:
        log("FAIL", "BAD IMG PATH", pg, "spaces/apostrophe in image src path")
    else:
        log("PASS", "PATH SAFETY", pg, "no unsafe image paths")

# ── Summary ───────────────────────────────────────────────────────────────────
time.sleep(0.3)
p()
p(f"{BOLD}{CYAN}{'━'*62}{RESET}")
p(f"{BOLD}{CYAN}  QA SUMMARY{RESET}")
p(f"{BOLD}{CYAN}{'━'*62}{RESET}")
total = len(passes) + len(fails) + len(warns)
p(f"  Total checks : {BOLD}{total}{RESET}")
p(f"  {GREEN}✅ PASS{RESET}  : {BOLD}{len(passes)}{RESET}")
p(f"  {RED}❌ FAIL{RESET}  : {BOLD}{len(fails)}{RESET}")
p(f"  {YELLOW}⚠️  WARN{RESET}  : {BOLD}{len(warns)}{RESET}")
p()

if fails:
    p(f"{BOLD}{RED}── FAILURES ──────────────────────────────────────────────{RESET}")
    for cat, pg, detail in fails:
        p(f"  {RED}❌{RESET}  [{cat}]  {pg} — {detail}")
    p()

if warns:
    p(f"{BOLD}{YELLOW}── WARNINGS ──────────────────────────────────────────────{RESET}")
    for cat, pg, detail in warns:
        p(f"  {YELLOW}⚠️ {RESET}  [{cat}]  {pg} — {detail}")
    p()

if not fails and not warns:
    p(f"  {GREEN}{BOLD}🎉  ALL CHECKS PASSED — project is clean!{RESET}")
elif not fails:
    p(f"  {YELLOW}{BOLD}✅  No failures — warnings are advisory only.{RESET}")
else:
    p(f"  {RED}{BOLD}⛔  Fix the failures above before deploying.{RESET}")

p()
p(f"{BOLD}{CYAN}{'━'*62}{RESET}")
p()
