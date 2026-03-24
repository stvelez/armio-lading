from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = "/Users/stibenvelez/Documents/GitHub/Armio/armio-landing/public/screenshots"
BASE_URL   = "http://localhost:5173"
EMAIL      = "avelez0793@gmail.com"
PASSWORD   = "Dapp-1020"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def login(page):
    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    # Llenar email
    email_input = page.locator('input[type="email"]').or_(
        page.locator('input[placeholder*="email"]')).or_(
        page.locator('input[placeholder*="correo"]')).or_(
        page.locator('input[name="email"]'))
    email_input.first.fill(EMAIL)
    # Llenar password
    page.locator('input[type="password"]').first.fill(PASSWORD)
    # Submit
    page.locator('button[type="submit"]').first.click()
    # Esperar navegación post-login
    page.wait_for_timeout(4000)
    page.wait_for_load_state("networkidle")
    current = page.url
    print(f"  after login → {current}")
    # Verificar que hay token en localStorage
    token = page.evaluate("localStorage.getItem('authToken')")
    print(f"  token present: {bool(token)}")
    return bool(token)

def shot(page, url, filename, wait_ms=3000, action=None, wait_selector=None):
    page.goto(f"{BASE_URL}{url}")
    page.wait_for_load_state("networkidle")
    # Esperar selector específico si se proporciona
    if wait_selector:
        try:
            page.wait_for_selector(wait_selector, timeout=8000)
        except:
            pass
    page.wait_for_timeout(wait_ms)
    if action:
        action(page)
        page.wait_for_timeout(1200)
    out = os.path.join(OUTPUT_DIR, filename)
    page.screenshot(path=out, full_page=False)
    size = os.path.getsize(out) // 1024
    print(f"  ok  {filename}  ({size} KB)")

def open_quickview(page):
    try:
        # Esperar a que la tabla cargue
        page.wait_for_selector("table tbody tr", timeout=8000)
        page.locator("table tbody tr").first.click()
    except Exception as e:
        print(f"    quickview: {e}")

def goto_detail(page):
    try:
        page.wait_for_selector("table tbody tr", timeout=8000)
        page.locator("table tbody tr").first.click()
        page.wait_for_timeout(800)
        btn = page.get_by_text("Ver completo")
        if btn.count() > 0:
            btn.first.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
    except Exception as e:
        print(f"    detail: {e}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    print("Logging in...")
    ok = login(page)
    if not ok:
        print("ERROR: login failed, no token found")
        browser.close()
        exit(1)

    print("Capturing...")
    shot(page, "/",                                "01-dashboard.jpg",         wait_selector="h1, .dashboard, [class*='dashboard']")
    shot(page, "/properties",                      "02-properties-list.jpg",   wait_selector="table, [class*='properties']")
    shot(page, "/properties",                      "03-property-quickview.jpg",wait_selector="table tbody tr", action=open_quickview)
    shot(page, "/properties",                      "04-property-detail.jpg",   wait_selector="table tbody tr", action=goto_detail)
    shot(page, "/properties/create",               "05-property-create.jpg",   wait_selector="form, [class*='stepper'], [class*='form']")
    shot(page, "/properties/create?tab=multimedia","06-property-multimedia.jpg",wait_selector="[class*='drop'], [class*='upload'], input[type='file']")
    shot(page, "/crm/leads",                       "07-crm-kanban.jpg",        wait_selector="[class*='kanban'], [class*='lead'], h1")
    shot(page, "/crm/leads/my-day",                "08-my-day.jpg",            wait_selector="h1")
    shot(page, "/agents",                          "09-agents.jpg",            wait_selector="table, h1")
    shot(page, "/clients",                         "10-clients.jpg",           wait_selector="[class*='client'], [class*='card'], h1")
    shot(page, "/contracts",                       "11-contracts.jpg",         wait_selector="h1")
    shot(page, "/contracts/create",                "12-contract-create.jpg",   wait_selector="form, h1")
    shot(page, "/users",                           "13-users.jpg",             wait_selector="table, h1")

    browser.close()
    print(f"\nDone — {OUTPUT_DIR}")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        if f.endswith('.jpg'):
            size = os.path.getsize(os.path.join(OUTPUT_DIR, f)) // 1024
            print(f"  {f}  {size} KB")
