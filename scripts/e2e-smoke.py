import os
import re
import time
from pathlib import Path
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent.parent
env = {}
for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
    if line and not line.startswith("#") and "=" in line:
        key, value = line.split("=", 1)
        env[key] = value


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    for attempt in range(5):
        try:
            page.goto("http://127.0.0.1:3000/", timeout=30_000)
            break
        except Exception:
            if attempt == 4:
                raise
            time.sleep(2)
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("Naturalmente", exact=False).is_visible()
    assert page.get_by_text("Obras que avanzan", exact=True).is_visible()
    page.screenshot(path=str(ROOT / "artifacts-home.png"), full_page=True)

    for route, heading in [
        ("/autoridades", "Autoridades y organización"),
        ("/obras", "Obras con seguimiento abierto"),
        ("/noticias", "Noticias de nuestro municipio"),
        ("/documentos", "Documentos y transparencia"),
    ]:
        page.goto(f"http://127.0.0.1:3000{route}")
        page.wait_for_load_state("networkidle")
        assert page.get_by_role("heading", name=heading).is_visible()

    page.goto("http://127.0.0.1:3000/denuncias")
    page.wait_for_load_state("networkidle")
    page.locator("#fullName").fill("Prueba automática municipal")
    page.locator("#phone").fill("70000000")
    page.locator("#location").fill("Plaza principal, sector norte")
    page.locator("#description").fill("Reporte de prueba integral del sistema; puede marcarse como resuelto.")
    page.locator("#category").click()
    page.get_by_role("option", name="Otro").click()
    page.get_by_role("button", name="Enviar reporte").click()
    page.get_by_text("Reporte recibido", exact=True).wait_for(timeout=15_000)
    ticket_text = page.locator("text=/SM-2026-[0-9]{3,}/").first.text_content() or ""
    assert re.search(r"SM-2026-\d{3,}", ticket_text)

    page.goto("http://127.0.0.1:3000/login")
    page.wait_for_load_state("networkidle")
    page.locator("#email").fill(env["ADMIN_BOOTSTRAP_EMAIL"])
    page.locator("#password").fill(env["ADMIN_BOOTSTRAP_PASSWORD"])
    page.get_by_role("button", name="Ingresar al sistema").click()
    page.wait_for_url("**/admin", timeout=15_000)
    page.get_by_role("heading", name="Resumen municipal").wait_for(timeout=15_000)
    page.screenshot(path=str(ROOT / "artifacts-admin.png"), full_page=True)
    assert page.get_by_text("Obras", exact=True).first.is_visible()

    page.goto("http://127.0.0.1:3000/admin/noticias")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Nuevo registro").click()
    page.locator("#title").fill("Noticia temporal de verificación")
    page.locator("#slug").fill("noticia-temporal-verificacion")
    page.locator("#excerpt").fill("Registro temporal para validar el CRUD del CMS.")
    page.locator("#body").fill("Este contenido se crea y elimina automáticamente durante la prueba integral.")
    page.get_by_role("button", name="Guardar", exact=True).click()
    page.get_by_text("Registro creado", exact=True).wait_for(timeout=15_000)
    test_row = page.locator("div").filter(has_text="Noticia temporal de verificación").filter(has=page.get_by_role("button", name="Eliminar")).last
    page.once("dialog", lambda dialog: dialog.accept())
    test_row.get_by_role("button", name="Eliminar").click()
    page.get_by_text("Registro eliminado", exact=True).wait_for(timeout=15_000)

    page.goto("http://127.0.0.1:3000/admin/denuncias")
    page.wait_for_load_state("networkidle")
    page.get_by_text(ticket_text.strip(), exact=True).first.click()
    page.get_by_role("combobox").click()
    page.get_by_role("option", name="Resuelto").click()
    page.locator("#reply").fill("Reporte verificado por la mesa de ayuda. Prueba integral completada.")
    page.get_by_role("button", name="Guardar y publicar").click()
    page.get_by_text("Respuesta registrada", exact=True).wait_for(timeout=15_000)

    page.goto(f"http://127.0.0.1:3000/denuncias/seguimiento?ticket={ticket_text.strip()}")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Consultar").click()
    page.get_by_text("Reporte verificado por la mesa de ayuda", exact=False).wait_for(timeout=15_000)
    assert page.get_by_text("Resuelto", exact=True).is_visible()

    assert not console_errors, f"Console errors: {console_errors}"
    browser.close()

print("E2E_SMOKE_OK")
