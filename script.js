/* =========================
   L3me — script.js
   Requisitos:
   - Menu mobile (a11y com aria-expanded)
   - Scroll suave para âncoras
   - FAQ em acordeão
   - Validação simples do formulário + feedback (sem backend)
   - CTA WhatsApp (wa.me) com placeholder
   ========================= */

(function () {
  // ====== CONFIG (placeholders) ======
  // ✅ Troque para o número real (somente dígitos, com DDI+DDD): ex. 5511987654321
  const WHATSAPP_NUMBER = "5511900000000";

  // ✅ Troque para o e-mail real
  const CONTACT_EMAIL = "contato@l3me.com.br";

  // ====== Helpers ======
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildWhatsAppUrl(message) {
    const base = `https://wa.me/${WHATSAPP_NUMBER}`;
    const text = message ? `?text=${encodeURIComponent(message)}` : "";
    return base + text;
  }
 

  // ====== Year in footer ======
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ====== WhatsApp links ======
  $$("[data-wa-link]").forEach((a) => {
    const msg = a.getAttribute("data-wa-message") || "Olá! Quero saber mais sobre criação de sites para meu negócio.";
    a.setAttribute("href", buildWhatsAppUrl(msg));
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.setAttribute("aria-label", "Abrir conversa no WhatsApp");
  });

  // ====== Mobile menu ======
  const menuButton = $("[data-menu-button]");
  const menu = $("[data-menu]");

  function setMenu(open) {
    if (!menuButton || !menu) return;

    menu.dataset.open = open ? "true" : "false";
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const isOpen = menu.dataset.open === "true";
      setMenu(!isOpen);
    });

    // Fecha ao clicar em link
    $$(".site-nav a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    // Fecha com ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });

    // Estado inicial
    setMenu(false);
  }

  // ====== Smooth scroll for anchors (with header offset) ======
  // Obs.: já existe scroll-behavior no CSS, mas aqui garantimos offset do header.
  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;

    const headerH = 72; // alinhado com --header-h
    const y = el.getBoundingClientRect().top + window.scrollY - headerH + 2;

    window.scrollTo({
      top: y,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const id = href.slice(1);
      const exists = document.getElementById(id);
      if (!exists) return;

      e.preventDefault();
      scrollToId(id);

      // Mantém URL limpa
      history.pushState(null, "", `#${id}`);
    });
  });

  // ====== FAQ Accordion ======
  const accordion = $("[data-accordion]");
  if (accordion) {
    const buttons = $$(".accordion-button", accordion);

    function closeAll(exceptBtn) {
      buttons.forEach((btn) => {
        if (btn === exceptBtn) return;
        btn.setAttribute("aria-expanded", "false");
        const panel = btn.closest(".accordion-item")?.querySelector(".accordion-panel");
        if (panel) panel.hidden = true;
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        const panel = btn.closest(".accordion-item")?.querySelector(".accordion-panel");
        if (!panel) return;

        // Opcional: fecha os outros para ficar mais limpo
        closeAll(btn);

        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        panel.hidden = expanded;
      });
    });
  }

  // ====== Form validation (simple) + mailto simulation ======
  const form = $("#leadForm");
  const statusEl = $("[data-form-status]");

  function setStatus(type, msg) {
    if (!statusEl) return;
    statusEl.classList.remove("ok", "err");
    if (type) statusEl.classList.add(type);
    statusEl.textContent = msg || "";
  }

  function isValidEmail(email) {
    // simples e suficiente para front-end
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      setStatus("", "");

      const nome = ($("#nome")?.value || "").trim();
      const email = ($("#email")?.value || "").trim();
      const mensagem = ($("#mensagem")?.value || "").trim();

      if (nome.length < 2) {
        setStatus("err", "Por favor, informe seu nome (mínimo 2 caracteres).");
        $("#nome")?.focus();
        return;
      }
      if (!isValidEmail(email)) {
        setStatus("err", "Por favor, informe um e-mail válido.");
        $("#email")?.focus();
        return;
      }
      if (mensagem.length < 10) {
        setStatus("err", "Por favor, escreva uma mensagem um pouco mais detalhada (mínimo 10 caracteres).");
        $("#mensagem")?.focus();
        return;
      }

      // Monta mailto (sem backend)
      const subject = `Contato pelo site — ${nome}`;
      const body =
        `Nome: ${nome}\n` +
        `Email: ${email}\n\n` +
        `Mensagem:\n${mensagem}\n\n` +
        `---\nEnviado via site (demo).`;

      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      setStatus("ok", "Mensagem pronta! Abrindo seu e-mail para enviar…");

      // Pequeno delay para feedback de acessibilidade
      setTimeout(() => {
        window.location.href = mailto;
      }, 300);

      // Opcional: limpar formulário após acionar (comentado para não perder dados)
      // form.reset();
    });
  }
})();