"""
HDA Website Demo — automated walkthrough using Selenium
Navigates the site page by page, scrolls through sections, and shows interactions.
"""

import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE = Path(__file__).parent.resolve()

def url(page):
    return f"file://{BASE}/{page}"

def smooth_scroll(driver, distance=400, steps=12, delay=0.04):
    for _ in range(steps):
        driver.execute_script(f"window.scrollBy(0, {distance // steps});")
        time.sleep(delay)

def scroll_to_bottom(driver, step=350, delay=0.05):
    total = driver.execute_script("return document.body.scrollHeight")
    scrolled = 0
    while scrolled < total:
        driver.execute_script(f"window.scrollBy(0, {step});")
        scrolled += step
        time.sleep(delay)

def scroll_to_top(driver):
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(0.4)

def pause(s=1.2):
    time.sleep(s)

# ── Driver setup ──────────────────────────────────────────────────────────────
opts = Options()
opts.add_argument("--window-size=1280,800")
opts.add_argument("--disable-infobars")
opts.add_argument("--disable-extensions")
opts.add_experimental_option("excludeSwitches", ["enable-automation"])
opts.add_experimental_option("useAutomationExtension", False)

# Use Selenium Manager (bundled) — no manual chromedriver needed
driver = webdriver.Chrome(options=opts)
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
    "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
})
wait = WebDriverWait(driver, 8)

try:
    # ── 1. INDEX PAGE ─────────────────────────────────────────────────────────
    print("▶ index.html — Hero & Home")
    driver.get(url("index.html"))
    pause(1.5)

    # Scroll through hero
    smooth_scroll(driver, 600, steps=15, delay=0.05)
    pause(0.8)

    # Scroll through stats / social proof
    smooth_scroll(driver, 800, steps=20, delay=0.04)
    pause(1)

    # Scroll through rest of page
    scroll_to_bottom(driver, step=300, delay=0.045)
    pause(1.2)
    scroll_to_top(driver)
    pause(0.6)

    # ── 2. COACHING PAGE ──────────────────────────────────────────────────────
    print("▶ coaching.html — Services")
    driver.get(url("coaching.html"))
    pause(1.5)

    scroll_to_bottom(driver, step=280, delay=0.045)
    pause(1)

    # Try clicking a tab if present
    try:
        tabs = driver.find_elements(By.CSS_SELECTOR, ".tab-btn, [data-tab]")
        for tab in tabs[:3]:
            driver.execute_script("arguments[0].click();", tab)
            pause(0.7)
    except Exception:
        pass

    # Try expanding an FAQ accordion item
    try:
        faqs = driver.find_elements(By.CSS_SELECTOR, ".faq-question, .accordion-trigger")
        for faq in faqs[:3]:
            driver.execute_script("arguments[0].click();", faq)
            pause(0.6)
    except Exception:
        pass

    scroll_to_top(driver)
    pause(0.6)

    # ── 3. EDUCATION PAGE ─────────────────────────────────────────────────────
    print("▶ education.html — Mentorship & 4-Layer System")
    driver.get(url("education.html"))
    pause(1.5)

    # Scroll to teacher section
    smooth_scroll(driver, 700, steps=18, delay=0.045)
    pause(1)

    # Scroll into 4-Layer section
    try:
        four_layer = driver.find_element(By.CSS_SELECTOR, ".four-layer-section")
        driver.execute_script("arguments[0].scrollIntoView({behavior:'smooth', block:'start'});", four_layer)
        pause(1.2)
        # Hover each card
        cards = driver.find_elements(By.CSS_SELECTOR, ".layer-card")
        actions = ActionChains(driver)
        for card in cards:
            actions.move_to_element(card).perform()
            pause(0.5)
    except Exception:
        pass

    # Scroll into Priyanshu slider section
    try:
        slider_section = driver.find_element(By.CSS_SELECTOR, ".mentorship-story-section")
        driver.execute_script("arguments[0].scrollIntoView({behavior:'smooth', block:'center'});", slider_section)
        pause(1.2)

        # Click through slider slides
        next_btn = driver.find_element(By.CSS_SELECTOR, ".slider-btn--next")
        for _ in range(6):
            driver.execute_script("arguments[0].click();", next_btn)
            pause(0.6)

        # Go back a couple
        prev_btn = driver.find_element(By.CSS_SELECTOR, ".slider-btn--prev")
        for _ in range(2):
            driver.execute_script("arguments[0].click();", prev_btn)
            pause(0.5)
    except Exception:
        pass

    # Scroll to CTA / footer
    scroll_to_bottom(driver, step=300, delay=0.045)
    pause(1.2)
    scroll_to_top(driver)
    pause(0.6)

    # ── 4. OPEN APPLY MODAL ───────────────────────────────────────────────────
    print("▶ Opening Apply Modal")
    driver.get(url("education.html"))
    pause(1.2)
    try:
        # Click any CTA button that opens the modal
        cta_btn = driver.find_element(By.CSS_SELECTOR, "[onclick*='openApplyModal'], .btn-primary")
        driver.execute_script("arguments[0].scrollIntoView({behavior:'smooth', block:'center'});", cta_btn)
        pause(0.6)
        driver.execute_script("arguments[0].click();", cta_btn)
        pause(1.2)

        # Fill step 1 name field
        try:
            name_field = driver.find_element(By.CSS_SELECTOR, "#apply-name, input[name='name'], input[placeholder*='name' i]")
            name_field.send_keys("Priyanshu Demo")
            pause(0.4)
        except Exception:
            pass

        # Close modal with Escape
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
        pause(0.8)
    except Exception:
        pass

    print("\n✅  Demo complete!")
    pause(2)

finally:
    driver.quit()
