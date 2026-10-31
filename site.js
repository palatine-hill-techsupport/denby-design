(() => {
  "use strict";

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function trapFocus(container, event) {
    if (event.key !== "Tab") return;
    const focusable = [...container.querySelectorAll(focusableSelector)]
      .filter((element) => !element.hasAttribute("hidden"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function buildMobileMenu() {
    const trigger = document.querySelector(".menu-toggle");
    if (!trigger || !("HTMLDialogElement" in window)) return;

    const currentPage = document.body.dataset.page || "";
    const root = location.pathname.includes("/posts/") ? "../" : "";
    const items = [
      ["home", "Home", `${root}index.html`],
      ["portfolio", "Portfolio", `${root}portfolio.html`],
      ["work", "Work With Me", `${root}work-with-me.html`],
      ["blog", "Blog", `${root}blog.html`],
      ["taixu", "TAIXU", `${root}taixu.html`],
      ["amped", "JB POS [AMPED]", `${root}amped.html`]
    ];
    const links = items.map(([key, label, href]) => {
      const current = key === currentPage ? ' aria-current="page"' : "";
      return `<a href="${href}"${current}>${label}</a>`;
    }).join("");

    const dialog = document.createElement("dialog");
    dialog.className = "mobile-menu";
    dialog.id = "mobile-menu";
    dialog.setAttribute("aria-labelledby", "mobile-menu-title");
    dialog.innerHTML = `
      <div class="mobile-menu-inner">
        <p class="mobile-menu-title" id="mobile-menu-title">Where would you like to go?</p>
        <button class="menu-close" type="button">Close menu ×</button>
        <nav class="mobile-menu-links" aria-label="Mobile">
          ${links}
        </nav>
      </div>`;
    document.body.append(dialog);

    const close = dialog.querySelector(".menu-close");
    const setOpenState = (open) => {
      trigger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    };

    trigger.addEventListener("click", () => {
      dialog.showModal();
      setOpenState(true);
      close.focus();
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      setOpenState(false);
      trigger.focus();
    });
    dialog.addEventListener("cancel", () => setOpenState(false));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function setupPortfolioModals() {
    const modals = [...document.querySelectorAll(".modal")];
    if (!modals.length) return;
    let returnFocus = null;

    const closeModal = (modal, updateUrl = true) => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (updateUrl && location.hash === `#${modal.id}`) {
        history.replaceState(null, "", location.pathname + location.search);
      }
      if (returnFocus) returnFocus.focus();
    };

    const openModal = (modal, trigger) => {
      modals.filter((item) => item !== modal).forEach((item) => closeModal(item, false));
      returnFocus = trigger || document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      document.body.classList.add("modal-open");
      const heading = modal.querySelector("h2");
      if (heading && !heading.id) heading.id = `${modal.id}-title`;
      if (heading) modal.setAttribute("aria-labelledby", heading.id);
      const close = modal.querySelector(".close-modal");
      if (close) close.focus();
    };

    document.querySelectorAll("[data-modal]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const modal = document.getElementById(trigger.dataset.modal);
        if (!modal) return;
        event.preventDefault();
        history.replaceState(null, "", `#${modal.id}`);
        openModal(modal, trigger);
      });
    });

    modals.forEach((modal) => {
      modal.setAttribute("aria-hidden", "true");
      modal.querySelector(".close-modal")?.addEventListener("click", () => closeModal(modal));
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(modal);
      });
      modal.addEventListener("keydown", (event) => trapFocus(modal, event));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const open = document.querySelector(".modal.is-open");
      if (open) closeModal(open);
    });

    if (location.hash) {
      const modal = document.querySelector(location.hash);
      if (modal?.classList.contains("modal")) openModal(modal, null);
    }
  }

  function setupBlogSearch() {
    const input = document.getElementById("blog-search");
    const cards = [...document.querySelectorAll(".article-card[data-search]")];
    const empty = document.getElementById("blog-empty");
    const status = document.getElementById("blog-status");
    if (!input || !cards.length) return;

    const filter = () => {
      const query = input.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const matches = !query || card.dataset.search.toLocaleLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
      if (status) {
        status.textContent = query
          ? `${visible} ${visible === 1 ? "post" : "posts"} found.`
          : "";
      }
    };
    input.addEventListener("input", filter);
  }

  function respectReducedMotion() {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".site-background").forEach((video) => {
      video.pause();
      video.removeAttribute("autoplay");
    });
  }

  function setupEmailForm() {
    const form = document.querySelector("[data-email-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const reason = String(data.get("reason") || "").trim();
      const message = String(data.get("message") || "").trim();
      const subject = reason || "A conversation with Denby";
      const body = [
        message,
        "",
        name ? `From: ${name}` : "",
        email ? `Reply to: ${email}` : ""
      ].filter(Boolean).join("\n");
      location.href = `mailto:hello@denby.design?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    respectReducedMotion();
    buildMobileMenu();
    setupPortfolioModals();
    setupBlogSearch();
    setupEmailForm();
  });
})();
