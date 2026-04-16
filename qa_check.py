"""
HDA Website — QA Check
Senior SDET / QA Engineer perspective
Tests: HTML structure, broken links, missing assets, nav consistency,
       JS errors, responsive layout, form elements, content integrity.
"""

import os
import re
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

BASE      = Path(__file__).parent.resolve()
BASE_URL  = "http://localhost:5500"
PAGES     = ["index.html", "coaching.html", "course.html", "mentorship.html"]
PASS      = "✅ PASS"
FAIL      = "❌ FAIL"
WARN      = "⚠️  WARN"

results   = []

def log(status, category, page, detail):
    results.append((status, category, page, detail))
    print(f"  {status}  [{category}]  {page} — {detail}")

# ── Static checks (no browser needed) ────────────────────────────────────────

print("\n" + "="*70)
print("  STATIC ANALYSIS")
print("="*70)

# 1. Check all HTML files exist
for p in PAGES:
    path = BASE / p
    if path.exists():
        log(PASS, "FILE EXISTS", p, f"{path.stat().st_size} bytes")
    else:
        log(FAIL, "FILE EXISTS", p, "FILE NOT FOUND")

# 2. Check all images referenced exist
print("\n--- Image asset check ---")
img_pattern = re.compile(r'src=["\'](?!http)(images/[^"\']+)["\']')
for page in PAGES:
    html = (BASE / page).read_text(errors='ignore')
    imgs = img_pattern.findall(html)
    for img in set(imgs):
        img_path = BASE / img
        if img_path.exists():
            log(PASS, "IMAGE", page, img)
        else:
            log(FAIL, "IMAGE MISSING", page, img)

# 3. Check internal hrefs resolve
print("\n--- Internal link check ---")
href_pattern = re.compile(r'href=["\'](?!http|#|mailto|tel|javascript)([^"\']+)["\']')
for page in PAGES:
    html = (BASE / page).read_text(errors='ignore')
    hrefs = href_pattern.findall(html)
    for href in set(hrefs):
        target = href.split('#')[0]
        if not target:
            continue
        target_path = BASE / target
        if target_path.exists():
            log(PASS, "LINK", page, href)
        else:
            log(FAIL, "BROKEN LINK", page, href)

# 4. Nav consistency — every page must link to all 4 pages + Apply Now
print("\n--- Nav consistency check ---")
expected_nav = ["index.html", "coaching.html", "course.html", "mentorship.html"]
for page in PAGES:
    html = (BASE / page).read_text(errors='ignore')
    nav_block = re.search(r'<ul class="nav-links">(.*?)</ul>', html, re.DOTALL)
    mobile_block = re.search(r'<div class="mobile-menu"[^>]*>(.*?)</div>', html, re.DOTALL)
    for link in expected_nav:
        if link in (nav_block.group(1) if nav_block else ''):
            log(PASS, "NAV LINK", page, f"desktop → {link}")
        else:
            log(FAIL, "NAV LINK", page, f"desktop missing → {link}")
        if link in (mobile_block.group(1) if mobile_block else ''):
            log(PASS, "NAV LINK", page, f"mobile → {link}")
        else:
            log(FAIL, "NAV LINK", page, f"mobile missing → {link}")
    # Check Apply Now / mm-cta
    if 'openApplyModal' in html:
        log(PASS, "NAV CTA", page, "Apply Now / openApplyModal present")
    else:
        log(FAIL, "NAV CTA", page, "Apply Now missing")

# 5. Footer consistency
print("\n--- Footer check ---")
for page in PAGES:
    html = (BASE / page).read_text(errors='ignore')
    if '<footer>' in html or '<footer ' in html:
        log(PASS, "FOOTER", page, "footer element present")
    else:
        log(FAIL, "FOOTER", page, "footer missing")
    if 'hda-logo.jpeg' in html:
        log(PASS, "FOOTER LOGO", page, "logo in footer")
    else:
        log(WARN, "FOOTER LOGO", page, "no logo in footer")
    if '© 2026' in html:
        log(PASS, "FOOTER COPYRIGHT", page, "copyright present")
    else:
        log(WARN, "FOOTER COPYRIGHT", page, "copyright missing")

# 6. Active nav class — each page should mark itself active
print("\n--- Active nav state ---")
active_map = {
    "index.html":      "index.html",
    "coaching.html":   "coaching.html",
    "course.html":     "course.html",
    "mentorship.html": "mentorship.html",
}
for page, self_link in active_map.items():
    html = (BASE / page).read_text(errors='ignore')
    pattern = rf'href="{self_link}"[^>]*class="active"|class="active"[^>]*href="{self_link}"'
    if re.search(pattern, html):
        log(PASS, "ACTIVE NAV", page, f"{self_link} marked active")
    else:
        log(WARN, "ACTIVE NAV", page, f"{self_link} NOT marked active in nav-links (JS may handle)")

# 7. Viewport meta tag
print("\n--- Viewport meta ---")
for page in PAGES:
    html = (BASE / page).read_text(errors='ignore')
    if 'name="viewport"' in html:
        log(PASS, "VIEWPORT", page, "viewport meta present")
    else:
        log(FAIL, "VIEWPORT", page, "viewport meta MISSING")

# 8. JS and CSS includes
print("\n--- Asset includes ---")
for page in PAGES:
    html = (BASE / page).read_text(errors='ignore')
    if 'css/style.css' in html:
        log(PASS, "CSS", page, "style.css linked")
    else:
        log(FAIL, "CSS", page, "style.css NOT linked")
    if 'js/main.js' in html:
        log(PASS, "JS", page, "main.js linked")
    else:
        log(FAIL, "JS", page, "main.js NOT linked")
    if 'emailjs' in html.lower():
        log(PASS, "EMAILJS", page, "EmailJS CDN present")
    else:
        log(WARN, "EMAILJS", page, "EmailJS CDN missing")

# 9. education.html references — should be gone
print("\n--- Stale education.html references ---")
for page in PAGES:
    html = (BASE / page).read_text(errors='ignore')
    if 'education.html' in html:
        log(FAIL, "STALE LINK", page, "still references education.html")
    else:
        log(PASS, "STALE LINK", page, "no stale education.html refs")

# ── Browser checks ────────────────────────────────────────────────────────────

print("\n" + "="*70)
print("  BROWSER / RUNTIME CHECKS")
print("="*70)

opts = Options()
opts.add_argument("--window-size=390,844")   # iPhone 14 Pro viewport
opts.add_argument("--disable-infobars")
opts.add_argument("--disable-extensions")
opts.add_experimental_option("excludeSwitches", ["enable-automation"])
opts.add_experimental_option("useAutomationExtension", False)

driver = webdriver.Chrome(options=opts)
wait   = WebDriverWait(driver, 6)

js_errors_global = []

def get_js_errors(driver):
    logs = driver.get_log("browser")
    errs = [l for l in logs if l['level'] in ('SEVERE', 'WARNING') and 'favicon' not in l['message'].lower()]
    return errs

try:
    for page in PAGES:
        url = f"{BASE_URL}/{page}"
        print(f"\n--- {page} ---")
        driver.get(url)
        time.sleep(1.2)

        # JS console errors
        errs = get_js_errors(driver)
        if errs:
            for e in errs:
                log(FAIL, "JS ERROR", page, e['message'][:120])
        else:
            log(PASS, "JS ERRORS", page, "no console errors")

        # Page title not empty
        title = driver.title
        if title and len(title) > 5:
            log(PASS, "TITLE", page, title)
        else:
            log(FAIL, "TITLE", page, f"title too short or empty: '{title}'")

        # Nav renders
        nav = driver.find_elements(By.CSS_SELECTOR, "nav")
        if nav:
            log(PASS, "NAV RENDER", page, "nav element found")
        else:
            log(FAIL, "NAV RENDER", page, "nav element NOT found")

        # Logo image loads (not broken)
        try:
            logo = driver.find_element(By.CSS_SELECTOR, ".nav-logo-img")
            natural_w = driver.execute_script("return arguments[0].naturalWidth", logo)
            if natural_w > 0:
                log(PASS, "LOGO IMG", page, f"loaded ({natural_w}px wide)")
            else:
                log(FAIL, "LOGO IMG", page, "broken image (naturalWidth=0)")
        except Exception:
            log(WARN, "LOGO IMG", page, "logo img not found")

        # Hamburger exists
        hamburger = driver.find_elements(By.ID, "hamburger")
        if hamburger:
            log(PASS, "HAMBURGER", page, "hamburger button present")
        else:
            log(FAIL, "HAMBURGER", page, "hamburger button missing")

        # Mobile menu exists
        mob_menu = driver.find_elements(By.ID, "mobileMenu")
        if mob_menu:
            log(PASS, "MOBILE MENU", page, "mobileMenu div present")
        else:
            log(FAIL, "MOBILE MENU", page, "mobileMenu div MISSING")

        # Hamburger opens mobile menu
        if hamburger and mob_menu:
            driver.execute_script("arguments[0].click()", hamburger[0])
            time.sleep(0.4)
            is_open = 'open' in mob_menu[0].get_attribute('class')
            if is_open:
                log(PASS, "HAMBURGER TOGGLE", page, "mobile menu opens on tap")
                # Count links in mobile menu
                links = mob_menu[0].find_elements(By.TAG_NAME, "a")
                log(PASS, "MOBILE MENU LINKS", page, f"{len(links)} links: {[l.text for l in links]}")
            else:
                log(FAIL, "HAMBURGER TOGGLE", page, "mobile menu did NOT open")
            # Close it
            driver.execute_script("arguments[0].click()", hamburger[0])
            time.sleep(0.3)

        # All images on page loaded
        imgs = driver.find_elements(By.TAG_NAME, "img")
        broken = []
        for img in imgs:
            w = driver.execute_script("return arguments[0].naturalWidth", img)
            if w == 0:
                src = img.get_attribute("src") or "unknown"
                broken.append(src.split("/")[-1])
        if broken:
            log(FAIL, "IMAGES", page, f"broken images: {broken}")
        else:
            log(PASS, "IMAGES", page, f"all {len(imgs)} images loaded")

        # Footer renders
        footer = driver.find_elements(By.TAG_NAME, "footer")
        if footer:
            log(PASS, "FOOTER RENDER", page, "footer renders")
        else:
            log(FAIL, "FOOTER RENDER", page, "footer NOT rendered")

        # CTA button / openApplyModal
        cta_btns = driver.find_elements(By.CSS_SELECTOR, "[onclick*='openApplyModal']")
        if cta_btns:
            log(PASS, "CTA BUTTONS", page, f"{len(cta_btns)} Apply/CTA button(s) found")
        else:
            log(WARN, "CTA BUTTONS", page, "no openApplyModal buttons found")

        # Scroll to bottom — check no layout breaks
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(0.5)
        driver.execute_script("window.scrollTo(0, 0)")

    # ── Cross-page: click nav links from index ─────────────────────────────
    print("\n--- Cross-page navigation ---")
    nav_tests = [
        ("index.html",      "coaching.html",    "Coaching"),
        ("coaching.html",   "course.html",      "Course"),
        ("course.html",     "mentorship.html",  "Mentorship"),
        ("mentorship.html", "index.html",       "Home"),
    ]
    for from_page, to_page, link_text in nav_tests:
        driver.get(f"{BASE_URL}/{from_page}")
        time.sleep(0.8)
        try:
            link = driver.find_element(By.LINK_TEXT, link_text)
            driver.execute_script("arguments[0].click()", link)
            time.sleep(0.8)
            landed = driver.current_url.split("/")[-1]
            if landed == to_page:
                log(PASS, "NAV CLICK", from_page, f"'{link_text}' → {to_page}")
            else:
                log(FAIL, "NAV CLICK", from_page, f"'{link_text}' expected {to_page}, got {landed}")
        except Exception as ex:
            log(FAIL, "NAV CLICK", from_page, f"'{link_text}' not clickable: {ex}")

    # ── Apply modal ────────────────────────────────────────────────────────
    print("\n--- Apply modal ---")
    driver.get(f"{BASE_URL}/index.html")
    time.sleep(1)
    try:
        cta = driver.find_element(By.CSS_SELECTOR, "[onclick*='openApplyModal']")
        driver.execute_script("arguments[0].click()", cta)
        time.sleep(0.8)
        modal = driver.find_elements(By.CSS_SELECTOR, ".modal, .apply-modal, #applyModal, [id*='modal']")
        visible = [m for m in modal if m.is_displayed()]
        if visible:
            log(PASS, "MODAL", "index.html", f"modal opened ({visible[0].get_attribute('id') or visible[0].get_attribute('class')[:40]})")
        else:
            log(FAIL, "MODAL", "index.html", "modal NOT visible after CTA click")
        from selenium.webdriver.common.keys import Keys
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        time.sleep(0.4)
    except Exception as ex:
        log(FAIL, "MODAL", "index.html", str(ex)[:100])

    # ── Slider check (mentorship page) ────────────────────────────────────
    print("\n--- Priyanshu slider ---")
    driver.get(f"{BASE_URL}/mentorship.html")
    time.sleep(1)
    try:
        next_btn = driver.find_element(By.CSS_SELECTOR, ".slider-btn--next")
        track    = driver.find_element(By.CSS_SELECTOR, ".slider-track")
        initial_transform = driver.execute_script("return getComputedStyle(arguments[0]).transform", track)
        driver.execute_script("arguments[0].click()", next_btn)
        time.sleep(0.5)
        new_transform = driver.execute_script("return getComputedStyle(arguments[0]).transform", track)
        if initial_transform != new_transform:
            log(PASS, "SLIDER", "mentorship.html", "next button advances slides")
        else:
            log(FAIL, "SLIDER", "mentorship.html", "slider did not move on next click")
        dots = driver.find_elements(By.CSS_SELECTOR, ".slider-dot")
        log(PASS if len(dots) == 7 else FAIL, "SLIDER DOTS", "mentorship.html", f"{len(dots)} dots (expected 7)")
    except Exception as ex:
        log(FAIL, "SLIDER", "mentorship.html", str(ex)[:100])

    # ── 4-layer section (mentorship) ──────────────────────────────────────
    print("\n--- 4-Layer section ---")
    try:
        cards = driver.find_elements(By.CSS_SELECTOR, ".layer-card")
        log(PASS if len(cards) == 4 else FAIL, "4-LAYER CARDS", "mentorship.html", f"{len(cards)} cards (expected 4)")
        callout = driver.find_elements(By.CSS_SELECTOR, ".layer-callout")
        log(PASS if callout else FAIL, "4-LAYER CALLOUT", "mentorship.html", "callout block present" if callout else "callout MISSING")
    except Exception as ex:
        log(FAIL, "4-LAYER", "mentorship.html", str(ex)[:100])

    # ── Responsive layout — no horizontal scroll ──────────────────────────
    print("\n--- Horizontal overflow (mobile 390px) ---")
    for page in PAGES:
        driver.get(f"{BASE_URL}/{page}")
        time.sleep(0.8)
        body_w    = driver.execute_script("return document.body.scrollWidth")
        window_w  = driver.execute_script("return window.innerWidth")
        if body_w <= window_w:
            log(PASS, "NO H-SCROLL", page, f"body {body_w}px ≤ viewport {window_w}px")
        else:
            log(FAIL, "H-SCROLL", page, f"body {body_w}px > viewport {window_w}px — horizontal overflow!")

finally:
    driver.quit()

# ── Summary ───────────────────────────────────────────────────────────────────

print("\n" + "="*70)
print("  QA SUMMARY")
print("="*70)

passes = [r for r in results if r[0] == PASS]
fails  = [r for r in results if r[0] == FAIL]
warns  = [r for r in results if r[0] == WARN]

print(f"\n  Total checks : {len(results)}")
print(f"  {PASS}  : {len(passes)}")
print(f"  {FAIL}  : {len(fails)}")
print(f"  {WARN}  : {len(warns)}")

if fails:
    print("\n--- FAILURES ---")
    for _, cat, page, detail in fails:
        print(f"  ❌  [{cat}]  {page} — {detail}")

if warns:
    print("\n--- WARNINGS ---")
    for _, cat, page, detail in warns:
        print(f"  ⚠️   [{cat}]  {page} — {detail}")

print()
