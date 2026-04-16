"""
HDA Website — Visual Audit
Takes full-page screenshots of every page at mobile (390px) and desktop (1280px)
then scrolls through each section and flags visual anomalies.
"""

import time
import os
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

BASE_URL   = "http://localhost:5500"
PAGES      = ["index.html", "coaching.html", "course.html", "mentorship.html"]
SHOT_DIR   = Path(__file__).parent / "qa_screenshots"
SHOT_DIR.mkdir(exist_ok=True)

issues = []

def flag(page, viewport, section, detail):
    issues.append((page, viewport, section, detail))
    print(f"  ⚠️  [{viewport}] {page} / {section} — {detail}")

def make_driver(width, height):
    opts = Options()
    opts.add_argument(f"--window-size={width},{height}")
    opts.add_argument("--disable-infobars")
    opts.add_argument("--hide-scrollbars")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    return webdriver.Chrome(options=opts)

def full_page_screenshot(driver, path):
    total_h = driver.execute_script("return document.body.scrollHeight")
    driver.execute_script(f"document.body.style.minHeight='{total_h}px'")
    driver.set_window_size(driver.execute_script("return window.innerWidth"), total_h)
    time.sleep(0.3)
    driver.save_screenshot(str(path))
    # Reset
    driver.set_window_size(driver.execute_script("return window.innerWidth"), 844)

def scroll_and_shot(driver, page, label, shot_path):
    total = driver.execute_script("return document.body.scrollHeight")
    step  = 400
    pos   = 0
    while pos < total:
        driver.execute_script(f"window.scrollTo(0, {pos})")
        time.sleep(0.25)
        pos += step
    driver.execute_script("window.scrollTo(0, 0)")
    full_page_screenshot(driver, shot_path)
    print(f"    📸 {shot_path.name}")

VIEWPORTS = [
    ("mobile",  390,  844),
    ("desktop", 1280, 900),
]

for vp_name, vp_w, vp_h in VIEWPORTS:
    print(f"\n{'='*60}")
    print(f"  VISUAL AUDIT — {vp_name.upper()} ({vp_w}×{vp_h})")
    print(f"{'='*60}")

    driver = make_driver(vp_w, vp_h)

    try:
        for page in PAGES:
            print(f"\n  --- {page} ---")
            driver.get(f"{BASE_URL}/{page}")
            time.sleep(2)
            # Force-close lead popup via JS before anything else
            driver.execute_script("""
                var p = document.getElementById('leadPopup');
                if (p) { p.style.display = 'none'; p.style.opacity = '0'; }
                var m = document.getElementById('applyModal');
                if (m) { m.style.display = 'none'; }
                document.body.style.overflow = '';
                localStorage.setItem('hda_lead_captured', 'skipped');
            """)
            time.sleep(0.3)

            shot_path = SHOT_DIR / f"{vp_name}_{page.replace('.html','')}.png"
            scroll_and_shot(driver, page, vp_name, shot_path)

            # ── Visual checks ──────────────────────────────────────────

            # 1. Nav height reasonable
            nav = driver.find_element(By.TAG_NAME, "nav")
            nav_h = nav.size['height']
            if nav_h < 48 or nav_h > 100:
                flag(page, vp_name, "NAV", f"unusual height: {nav_h}px")
            else:
                print(f"    ✅ Nav height {nav_h}px")

            # 2. H1 visible and not tiny
            try:
                h1 = driver.find_element(By.TAG_NAME, "h1")
                h1_size = h1.value_of_css_property("font-size")
                h1_visible = h1.is_displayed()
                print(f"    ✅ H1 visible: {h1.text[:50]!r} @ {h1_size}")
                if not h1_visible:
                    flag(page, vp_name, "H1", "H1 not visible")
            except:
                flag(page, vp_name, "H1", "no H1 found")

            # 3. Images — check none are tiny (collapsed) or overflowing
            imgs = driver.find_elements(By.TAG_NAME, "img")
            for img in imgs:
                w = img.size['width']
                h = img.size['height']
                src = (img.get_attribute("src") or "")
                name = src.split("/")[-1][:40]
                if img.is_displayed() and (w < 10 or h < 10):
                    flag(page, vp_name, "IMG", f"collapsed image: {name} ({w}×{h})")
                loc_x = img.location['x']
                if loc_x + w > vp_w + 5:
                    flag(page, vp_name, "IMG OVERFLOW", f"{name} overflows right edge (x:{loc_x} w:{w})")

            # 4. Buttons visible and not tiny
            btns = driver.find_elements(By.CSS_SELECTOR, ".btn")
            for btn in btns:
                if btn.is_displayed():
                    bh = btn.size['height']
                    bw = btn.size['width']
                    if bh < 36:
                        flag(page, vp_name, "BTN", f"button too short: {btn.text[:30]!r} ({bh}px tall)")
                    if bw < 80:
                        flag(page, vp_name, "BTN", f"button too narrow: {btn.text[:30]!r} ({bw}px wide)")

            # 5. Footer at bottom
            try:
                footer = driver.find_element(By.TAG_NAME, "footer")
                footer_y = footer.location['y']
                body_h = driver.execute_script("return document.body.scrollHeight")
                gap = body_h - (footer_y + footer.size['height'])
                if gap > 50:
                    flag(page, vp_name, "FOOTER", f"large gap below footer: {gap}px")
                else:
                    print(f"    ✅ Footer position OK (gap {gap}px)")
            except:
                flag(page, vp_name, "FOOTER", "footer element not found")

            # 6. Check program cards on home page are distinct
            if page == "index.html":
                cards = driver.find_elements(By.CSS_SELECTOR, ".prog-card")
                print(f"    ✅ Program cards found: {len(cards)}")
                card_imgs = []
                for card in cards:
                    try:
                        img = card.find_element(By.TAG_NAME, "img")
                        nw  = driver.execute_script("return arguments[0].naturalWidth", img)
                        src = img.get_attribute("src").split("/")[-1]
                        card_imgs.append((src, nw))
                        h3  = card.find_element(By.CSS_SELECTOR, "h3")
                        tag = card.find_element(By.CSS_SELECTOR, ".prog-card-tag")
                        print(f"      Card: {h3.text!r} | tag: {tag.text!r} | img: {src} ({nw}px)")
                        if nw == 0:
                            flag(page, vp_name, "PROG CARD", f"broken image on card '{h3.text}'")
                    except Exception as e:
                        flag(page, vp_name, "PROG CARD", str(e)[:80])
                # Check all images are different
                srcs = [c[0] for c in card_imgs]
                if len(srcs) != len(set(srcs)):
                    flag(page, vp_name, "PROG CARDS", f"duplicate images used: {srcs}")
                else:
                    print(f"    ✅ All program card images are distinct")

            # 7. Mentorship slider visible
            if page == "mentorship.html":
                sliders = driver.find_elements(By.CSS_SELECTOR, ".story-slider")
                if sliders:
                    slider_w = sliders[0].size['width']
                    print(f"    ✅ Slider found, width: {slider_w}px")
                    if slider_w > vp_w:
                        flag(page, vp_name, "SLIDER", f"slider wider than viewport: {slider_w}px > {vp_w}px")
                else:
                    flag(page, vp_name, "SLIDER", "no slider found")

            # 8. Check no text/element is white-on-white or invisible
            sections = driver.find_elements(By.CSS_SELECTOR, "section h2")
            for s in sections:
                if s.is_displayed():
                    color = s.value_of_css_property("color")
                    bg    = s.value_of_css_property("background-color")
                    if color == bg and color != "rgba(0, 0, 0, 0)":
                        flag(page, vp_name, "TEXT COLOR", f"h2 text same as bg: {color}")

    finally:
        driver.quit()

# ── Summary ──────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print("  VISUAL AUDIT SUMMARY")
print(f"{'='*60}")
print(f"\n  Screenshots saved to: {SHOT_DIR}")
print(f"\n  Issues found: {len(issues)}")
if issues:
    for page, vp, section, detail in issues:
        print(f"  ⚠️  [{vp}] {page} / {section} — {detail}")
else:
    print("  ✅ No visual issues detected")
print()
