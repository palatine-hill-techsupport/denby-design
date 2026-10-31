(() => {
  "use strict";

  function setupBackgroundText() {
    const scrim = document.querySelector(".site-scrim");
    if (!scrim) return;
    const ascii = document.createElement("pre");
    ascii.className = "site-ascii";
    ascii.setAttribute("aria-hidden", "true");
    scrim.before(ascii);

    const chars = "denby.design";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    let cols = 0;
    let rows = 0;
    let cellW = 10;
    let cellH = 16;
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let frame = 0;
    let lastFrame = 0;
    const start = performance.now();

    function measure() {
      const width = ascii.clientWidth;
      const height = ascii.clientHeight;
      const portrait = height > width;
      const targetCols = width < 700 ? (portrait ? 30 : 46) : 92;
      const targetRows = width < 700 ? (portrait ? 40 : 24) : 42;
      const size = clamp(Math.min((width - 20) / (targetCols * .62), (height - 20) / (targetRows * .95)), 8, 18);
      ascii.style.fontSize = `${size}px`;
      cellW = size * .62;
      cellH = size * .95;
      cols = Math.ceil(width / cellW) + 1;
      rows = Math.ceil(height / cellH) + 1;
      draw(performance.now());
    }

    function draw(now) {
      const t = motion.matches ? 0 : (now - start) / 1000;
      const mx = mouseX / cellW;
      const my = mouseY / cellH;
      let output = "";
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const radius = Math.hypot(x - cols / 2, y - rows / 2);
          const pointerRadius = Math.hypot(x - mx, y - my);
          const wave = Math.sin(radius * .55 - t * 3.1) * .55
            + Math.sin(x * .35 + y * .2 + t * 1.35) * .2
            + Math.cos(x * .16 - y * .28 - t * 1.1) * .18
            + Math.sin(pointerRadius * .95 - t * 5.2) * Math.exp(-pointerRadius * .065);
          output += chars[Math.floor(clamp((wave + 1.8) / 3.6, 0, 1) * (chars.length - 1))];
        }
        if (y < rows - 1) output += "\n";
      }
      ascii.textContent = output;
    }

    function animate(now) {
      frame = 0;
      if (motion.matches || document.hidden) return;
      if (now - lastFrame >= 1000 / 30) {
        draw(now);
        lastFrame = now;
      }
      frame = requestAnimationFrame(animate);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      draw(performance.now());
      if (!motion.matches && !document.hidden) frame = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }, { passive: true });
    motion.addEventListener("change", syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);
    measure();
    syncAnimation();
  }

  function setupHomeIntro() {
    const hero = document.querySelector(".hero");
    const content = document.getElementById("home-content");
    const word = document.getElementById("rotating-word");
    if (!hero || !content || !word) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const words = [
      "a UX designer", "a digital fixer", "a systems untangler",
      "a product-minded designer", "a prototype builder", "a friction finder",
      "a curious generalist", "a design systems nerd",
      "a practical problem-solver", "a wave-watcher"
    ];
    let wordIndex = 0;
    let rotation;
    let transition;
    let snapTimer;
    let snapping = false;
    let touchStart = null;

    function syncRotation() {
      clearInterval(rotation);
      clearTimeout(transition);
      word.style.opacity = "1";
      word.style.transform = "translateY(0)";
      if (motion.matches || document.hidden) return;
      rotation = setInterval(() => {
        word.style.opacity = "0";
        word.style.transform = "translateY(-6px)";
        transition = setTimeout(() => {
          wordIndex = (wordIndex + 1) % words.length;
          word.textContent = words[wordIndex];
          word.style.opacity = "1";
          word.style.transform = "translateY(0)";
        }, 320);
      }, 2800);
    }

    function contentTop() {
      return content.getBoundingClientRect().top + window.scrollY;
    }

    function snapTo(top) {
      clearTimeout(snapTimer);
      snapping = true;
      window.scrollTo({ top, behavior: motion.matches ? "instant" : "smooth" });
      snapTimer = setTimeout(() => { snapping = false; }, motion.matches ? 80 : 760);
    }

    function snapBetweenSections(direction) {
      if (!direction || document.body.matches(".menu-open, .modal-open")) return false;
      if (snapping) return true;
      if (direction > 0 && window.scrollY < contentTop() - 24) {
        snapTo(contentTop());
        return true;
      }
      if (direction < 0 && window.scrollY > 0 && window.scrollY <= contentTop() + 24) {
        snapTo(0);
        return true;
      }
      return false;
    }

    hero.querySelector(".scroll-arrow").addEventListener("click", (event) => {
      event.preventDefault();
      snapTo(contentTop());
      content.focus({ preventScroll: true });
    });
    window.addEventListener("wheel", (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (snapBetweenSections(event.deltaY)) event.preventDefault();
    }, { passive: false });
    window.addEventListener("touchstart", (event) => {
      const touch = event.touches.length === 1 ? event.touches[0] : null;
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
    }, { passive: true });
    window.addEventListener("touchmove", (event) => {
      if (!touchStart || event.touches.length !== 1) return;
      const deltaY = touchStart.y - event.touches[0].clientY;
      const deltaX = touchStart.x - event.touches[0].clientX;
      if (Math.abs(deltaY) < 18 || Math.abs(deltaX) > Math.abs(deltaY)) return;
      if (snapBetweenSections(deltaY)) event.preventDefault();
      touchStart = null;
    }, { passive: false });
    window.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target.closest("a, button, input, select, textarea, [contenteditable], dialog, [role=dialog]")) return;
      const down = ["ArrowDown", "PageDown", " "].includes(event.key);
      const up = ["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey);
      if (snapBetweenSections(up ? -1 : down ? 1 : 0)) event.preventDefault();
    });
    motion.addEventListener("change", syncRotation);
    document.addEventListener("visibilitychange", syncRotation);
    syncRotation();
  }

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
    setupBackgroundText();
    setupHomeIntro();
    buildMobileMenu();
    setupPortfolioModals();
    setupBlogSearch();
    setupEmailForm();
  });
})();
