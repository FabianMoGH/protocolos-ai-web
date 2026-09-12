(() => {
  if (document.getElementById('trama-assistant')) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'trama-assistant';
  dialog.className = 'trama-chat';
  dialog.setAttribute('aria-labelledby', 'trama-chat-title');
  // This template is constant. All user/model text is inserted with textContent.
  dialog.innerHTML = `
    <header class="trama-chat-header"><div><span class="trama-chat-eyebrow">CONOCÉ EL PRODUCTO</span><h2 id="trama-chat-title">Asistente TramaClínicaMed</h2></div><button type="button" class="trama-chat-close" aria-label="Cerrar asistente">×</button></header>
    <p class="trama-chat-privacy">Consultas generales sobre el producto. No compartas datos personales, historias clínicas ni estudios. Tus mensajes se envían a OpenAI para responder.</p>
    <div class="trama-chat-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación"><p class="trama-chat-bubble">Hola, soy el Asistente TramaClínicaMed. Puedo explicarte cómo se relacionan el seguimiento clínico y Protocolos AI. ¿Qué te gustaría conocer?</p></div>
    <div class="trama-chat-quick" aria-label="Preguntas sugeridas"><button type="button">Seguimiento Clínico</button><button type="button">Protocolos AI</button><button type="button">¿Qué es TramaClínicaMed?</button></div>
    <p class="trama-chat-status" role="status"></p>
    <form class="trama-chat-form"><label for="trama-chat-input">Tu pregunta</label><div><textarea id="trama-chat-input" rows="2" maxlength="2000" placeholder="Preguntá sobre TramaClínicaMed…" required></textarea><button type="submit">Enviar</button></div><small>Hasta 2.000 caracteres. La conversación se conserva sólo mientras esta página siga abierta.</small></form>`;
  document.body.append(dialog);
  const floating = document.createElement('button');
  floating.type = 'button'; floating.className = 'trama-chat-floating'; floating.textContent = 'Asistente TramaClínicaMed';
  floating.dataset.assistantOpen = '';
  document.body.append(floating);
  const triggers = document.querySelectorAll('[data-assistant-open]');
  const input = dialog.querySelector('textarea');
  const form = dialog.querySelector('form');
  const log = dialog.querySelector('[role="log"]');
  const status = dialog.querySelector('[role="status"]');
  let opener = floating; let busy = false;
  const history = []; // Deliberately no localStorage, sessionStorage, cookies or remote conversation ID.
  for (const trigger of triggers) {
    trigger.setAttribute('aria-controls', dialog.id); trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', () => { opener = trigger; if (!dialog.open) dialog.showModal(); input.focus(); });
  }
  dialog.querySelector('.trama-chat-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener.focus());
  function bubble(text, role, sources = []) {
    const node = document.createElement('div'); node.className = `trama-chat-bubble ${role === 'user' ? 'trama-chat-user' : ''}`;
    const content = document.createElement('p'); content.textContent = text; node.append(content);
    if (sources.length) { const refs = document.createElement('small'); refs.textContent = `Fuentes: ${sources.join(' · ')}`; node.append(refs); }
    log.append(node); log.scrollTop = log.scrollHeight; return node;
  }
  function context() {
    const turns = history.slice(-12);
    while (turns.reduce((n, t) => n + t.content.length, 0) > 14000) turns.splice(0, 2);
    return turns;
  }
  async function send(message) {
    if (busy || !message.trim() || message.length > 2000) return;
    busy = true; status.textContent = 'Consultando la biblioteca pública…';
    const controls = [...form.querySelectorAll('button, textarea'), ...dialog.querySelectorAll('.trama-chat-quick button')];
    controls.forEach(el => { el.disabled = true; });
    const sent = bubble(message, 'user'); input.value = '';
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history: context() }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo obtener una respuesta.');
      if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('El asistente devolvió una respuesta vacía.');
      bubble(data.answer, 'assistant', Array.isArray(data.sources) ? data.sources.filter(s => typeof s === 'string') : []);
      history.push({ role: 'user', content: message }, { role: 'assistant', content: data.answer });
      status.textContent = '';
    } catch (error) {
      sent.remove(); input.value = message;
      status.textContent = error.name === 'AbortError' ? 'La consulta tardó demasiado. Podés volver a enviarla.' : error instanceof SyntaxError || error instanceof TypeError ? 'No se pudo conectar con el asistente. Probá más tarde.' : error.message;
    } finally { clearTimeout(timer); busy = false; controls.forEach(el => { el.disabled = false; }); if (dialog.open) input.focus(); }
  }
  form.addEventListener('submit', event => { event.preventDefault(); void send(input.value.trim()); });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); } });
  dialog.querySelectorAll('.trama-chat-quick button').forEach(button => button.addEventListener('click', () => void send(button.textContent)));
})();
