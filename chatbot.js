(() => {
  const widget = document.createElement('section');
  widget.className = 'chatbot';
  widget.setAttribute('aria-label', 'Voltaik AI assistant');
  widget.innerHTML = `
    <button class="chatbot-toggle" type="button" aria-expanded="false" aria-controls="chatbot-panel">
      <span class="chatbot-toggle-mark" aria-hidden="true">✦</span>
      <span>Ask Voltaik AI</span>
    </button>
    <div class="chatbot-panel" id="chatbot-panel" hidden>
      <div class="chatbot-header">
        <div>
          <p class="chatbot-eyebrow">VOLTAIK AI</p>
          <h2>Solar growth assistant</h2>
        </div>
        <button class="chatbot-close" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="chatbot-messages" aria-live="polite">
        <div class="chatbot-message chatbot-message-assistant">Ask me about Voltaik AI's solar lead generation, AI calling, appointment setting, or pricing model.</div>
      </div>
      <form class="chatbot-form">
        <label class="chatbot-sr-only" for="chatbot-input">Your question</label>
        <textarea id="chatbot-input" rows="1" maxlength="500" placeholder="Ask a question..." required></textarea>
        <button type="submit" aria-label="Send question">↑</button>
      </form>
      <p class="chatbot-status" role="status"></p>
    </div>`;
  document.body.appendChild(widget);

  const toggle = widget.querySelector('.chatbot-toggle');
  const panel = widget.querySelector('.chatbot-panel');
  const close = widget.querySelector('.chatbot-close');
  const form = widget.querySelector('.chatbot-form');
  const input = widget.querySelector('#chatbot-input');
  const messages = widget.querySelector('.chatbot-messages');
  const status = widget.querySelector('.chatbot-status');
  let closeTimer;

  const setOpen = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      clearTimeout(closeTimer);
      toggle.hidden = true;
      panel.classList.remove('is-closing');
      panel.hidden = false;
      input.focus();
      return;
    }

    panel.classList.add('is-closing');
    closeTimer = setTimeout(() => {
      panel.hidden = true;
      panel.classList.remove('is-closing');
      toggle.hidden = false;
      toggle.focus();
    }, 220);
  };

  const addMessage = (text, role) => {
    const message = document.createElement('div');
    message.className = `chatbot-message chatbot-message-${role} is-new`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || form.classList.contains('is-busy')) return;

    addMessage(question, 'user');
    input.value = '';
    form.classList.add('is-busy');
    status.textContent = 'Thinking...';

    try {
      const response = await fetch(window.VOLTAIK_CHAT_ENDPOINT || '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          page: document.body.innerText.slice(0, 24000)
        })
      });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          'The chat service is not connected on this deployment. Please deploy the /api/chat endpoint or contact mohamed@voltaikai.com.'
        );
      }
      if (!response.ok) throw new Error(data.error || 'The assistant is unavailable right now.');
      addMessage(data.answer, 'assistant');
    } catch (error) {
      addMessage(error.message || 'The assistant is unavailable right now. Please email mohamed@voltaikai.com.', 'assistant');
    } finally {
      form.classList.remove('is-busy');
      status.textContent = '';
      input.focus();
    }
  });
})();
