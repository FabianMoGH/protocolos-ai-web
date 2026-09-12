async (page) => {
  const base = page.url().split('/').slice(0, 3).join('/');
  const check = (v, message) => { if (!v) throw new Error(message); };
  const calls = []; let fail = false;
  await page.route('**/api/chat', async route => {
    calls.push(route.request().postDataJSON());
    await page.waitForTimeout(150); // Simulated provider latency, not a page readiness wait.
    await route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json', body: JSON.stringify(fail ? { error: 'Servicio de prueba no disponible.' } : { answer: 'Respuesta pública de prueba. <img src=x onerror=alert(1)>', sources: ['01_VISION_GENERAL.md'] }) });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  const dialog = page.getByRole('dialog');
  await page.getByRole('button', { name: 'Preguntale al Asistente', exact: true }).click();
  await dialog.getByRole('button', { name: 'Seguimiento Clínico', exact: true }).click();
  await dialog.getByText(/Respuesta pública de prueba/).waitFor();
  check(await dialog.locator('.trama-chat-bubble img').count() === 0, 'Respuesta insertada como texto seguro');
  await dialog.getByRole('button', { name: 'Cerrar asistente' }).click();
  await page.getByRole('button', { name: 'Asistente TramaClínicaMed', exact: true }).click();
  check(await dialog.getByText(/Respuesta pública de prueba/).count() === 1, 'Ambos accesos conservan conversación');
  await dialog.getByRole('textbox', { name: 'Tu pregunta' }).fill('¿Y Protocolos AI?');
  await dialog.getByRole('button', { name: 'Enviar', exact: true }).click();
  await dialog.getByRole('button', { name: 'Cerrar asistente' }).click();
  await page.getByRole('button', { name: 'Preguntale al Asistente', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.trama-chat-bubble small').length === 2);
  check(calls.length === 2 && calls[1].history.length === 2, 'Historial común y una solicitud por envío');
  await page.screenshot({ path: 'output/playwright/asistente-desktop.png', fullPage: false });
  fail = true;
  await dialog.getByRole('textbox', { name: 'Tu pregunta' }).fill('Pregunta recuperable');
  await dialog.getByRole('button', { name: 'Enviar', exact: true }).click();
  await dialog.getByText('Servicio de prueba no disponible.').waitFor();
  check(await dialog.getByRole('textbox', { name: 'Tu pregunta' }).inputValue() === 'Pregunta recuperable', 'Error conserva borrador');
  await page.setViewportSize({ width: 390, height: 844 });
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Sin desborde móvil');
  await page.screenshot({ path: 'output/playwright/asistente-movil.png', fullPage: false });
  await page.keyboard.press('Escape');
  check(!await dialog.isVisible(), 'Escape cierra');
  check(await page.locator('.trama-chat').count() === 1, 'Una sola instancia');
  await page.goto(`${base}/protocolos/`);
  await page.getByRole('button', { name: 'Preguntale al Asistente', exact: true }).click();
  check(await page.locator('.trama-chat').count() === 1, 'Página Protocolos con mismo componente');
  check(await dialog.locator('.trama-chat-user').count() === 0, 'Nueva página sin almacenamiento persistente');
  console.log('PASS chat compartido, historial, carga, errores, XSS, móvil, Escape y ambas páginas. OpenAI simulado.');
}
