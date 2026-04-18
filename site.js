// ── ASCII ripple ─────────────────────────────────────────────────
const ascii = document.getElementById("ascii");
const chars = "denby.design";
const S = {
  cols: 0, rows: 0,
  cellW: 10, cellH: 16,
  padX: 0, padY: 0,
  left: 0, top: 0, width: 0, height: 0,
  t0: performance.now(),
  mouseX: innerWidth * 0.5, mouseY: innerHeight * 0.5,
  mouseVX: 0, mouseVY: 0,
  lastMX: innerWidth * 0.5, lastMY: innerHeight * 0.5,
  lastMoveT: performance.now(),
  pulse: 0
};

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

function measureGrid() {
  const vp = window.visualViewport;
  const vw = vp ? vp.width : innerWidth;
  const vh = vp ? vp.height : innerHeight;
  const portrait = vh > vw;
  const tCols = vw < 700 ? (portrait ? 30 : 46) : 92;
  const tRows = vw < 700 ? (portrait ? 40 : 24) : 42;
  ascii.style.fontSize = `${clamp(Math.min((vw - 20) / (tCols * 0.62), (vh - 20) / (tRows * 0.95)), 8, 18)}px`;

  const st = getComputedStyle(ascii);
  const ls = parseFloat(st.letterSpacing);
  const lspx = isFinite(ls) ? ls : 0;

  const probe = document.createElement("span");
  probe.textContent = "MMMMMMMMMM";
  probe.style.cssText = `visibility:hidden;position:absolute;font:${st.font};letter-spacing:${st.letterSpacing}`;
  document.body.appendChild(probe);
  const r = probe.getBoundingClientRect();
  document.body.removeChild(probe);

  S.cellW = Math.max(1, (r.width + lspx) / 10);
  const clh = parseFloat(st.lineHeight);
  S.cellH = Math.max(1, isFinite(clh) ? clh : r.height * 0.95);

  const ar = ascii.getBoundingClientRect();
  S.left = ar.left; S.top = ar.top;
  S.width = ar.width || vw; S.height = ar.height || vh;
  S.cols = Math.max(30, Math.ceil((S.width  - S.padX * 2) / S.cellW) + 1);
  S.rows = Math.max(14, Math.ceil((S.height - S.padY * 2) / S.cellH) + 1);
}

function onPointerMove(e) {
  const now = performance.now();
  const dt  = Math.max(8, now - S.lastMoveT);
  const dx  = e.clientX - S.lastMX;
  const dy  = e.clientY - S.lastMY;
  S.mouseVX = dx / dt; S.mouseVY = dy / dt;
  S.mouseX = e.clientX; S.mouseY = e.clientY;
  S.lastMX = e.clientX; S.lastMY = e.clientY;
  S.lastMoveT = now;
  S.pulse = Math.min(1.5, S.pulse + Math.hypot(dx, dy) * 0.01);
}

function sample(x, y, t) {
  const sx = x - S.cols * 0.5, sy = y - S.rows * 0.5;
  const r  = Math.hypot(sx, sy) || 1;
  const mx = clamp((S.mouseX - S.left - S.padX) / S.cellW, 0, S.cols - 1);
  const my = clamp((S.mouseY - S.top  - S.padY) / S.cellH, 0, S.rows - 1);
  const dxm = x - mx, dym = y - my;
  const rm  = Math.hypot(dxm, dym) || 1;

  const base =
    Math.sin(r * 0.55 - t * 3.1) * 0.55 +
    Math.sin((x * 0.35 + y * 0.2)  + t * 1.35) * 0.2 +
    Math.cos((x * 0.16 - y * 0.28) - t * 1.1)  * 0.18;

  const mouseRipple =
    Math.sin(rm * 0.95 - t * 5.2 + S.pulse * 1.5) *
    Math.exp(-rm * 0.065) *
    (0.95 + Math.min(1, Math.hypot(S.mouseVX, S.mouseVY) * 4));

  const mousePull    = Math.exp(-rm * 0.09) * 0.65;
  const directional  = ((dxm * S.mouseVX) + (dym * S.mouseVY)) * Math.exp(-rm * 0.12) * 0.08;
  const drift        = Math.sin((x / S.cols * 8 + t * 0.35)) * Math.cos((y / S.rows * 6 - t * 0.22)) * 0.12;

  return base + mouseRipple + mousePull + directional + drift;
}

function renderAscii(now) {
  const t = (now - S.t0) / 1000;
  S.pulse   *= 0.965;
  S.mouseVX *= 0.96;
  S.mouseVY *= 0.96;

  let out = "";
  for (let y = 0; y < S.rows; y++) {
    for (let x = 0; x < S.cols; x++) {
      out += chars[Math.floor(clamp((sample(x, y, t) + 1.8) / 3.6, 0, 1) * (chars.length - 1))];
    }
    if (y < S.rows - 1) out += "\n";
  }
  ascii.textContent = out;
  requestAnimationFrame(renderAscii);
}

window.addEventListener("resize", measureGrid);
window.addEventListener("orientationchange", measureGrid);
window.addEventListener("mousemove", onPointerMove, { passive: true });
window.addEventListener("touchmove", e => {
  if (e.touches[0]) onPointerMove(e.touches[0]);
}, { passive: true });
window.addEventListener("touchstart", e => {
  if (e.touches[0]) onPointerMove(e.touches[0]);
}, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", measureGrid);
  window.visualViewport.addEventListener("scroll", measureGrid);
}
measureGrid();
requestAnimationFrame(measureGrid);
requestAnimationFrame(renderAscii);

// ── Scroll arrow (homepage) ──────────────────────────────────────
const scrollArrow = document.querySelector('.scroll-arrow');
if (scrollArrow) {
  scrollArrow.addEventListener('click', e => {
    e.preventDefault();
    const main = document.getElementById('main');
    if (main) window.scrollTo({ top: main.offsetTop, behavior: 'smooth' });
  });
}

// ── Rotating tagline (homepage only) ────────────────────────────
const rotEl = document.getElementById("rotating-word");
if (rotEl) {
  const words = [
    "a UX designer",
    "a human-first builder",
    "a product thinker",
    "a digital fixer",
    "a visual storyteller",
    "a systems thinker",
    "a friction hunter",
    "a curious generalist",
    "a design-led strategist",
    "a wave-watcher",
  ];
  let wordIdx = 0;
  function rotateWord() {
    rotEl.style.opacity = "0";
    rotEl.style.transform = "translateY(-6px)";
    setTimeout(() => {
      wordIdx = (wordIdx + 1) % words.length;
      rotEl.textContent = words[wordIdx];
      rotEl.style.opacity = "1";
      rotEl.style.transform = "translateY(0)";
    }, 320);
  }
  setInterval(rotateWord, 2800);
}

// ── Modal system ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Auto-open modal from URL hash (e.g. portfolio.html#modal-shoutstack)
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target && target.classList.contains("modal")) {
      target.classList.add("is-open");
      document.body.classList.add("modal-open");
      // Clean the hash from the URL without triggering a scroll jump
      history.replaceState(null, "", window.location.pathname);
    }
  }

  // Open via data-modal attribute
  document.querySelectorAll("[data-modal]").forEach(trigger => {
    trigger.addEventListener("click", e => {
      e.preventDefault();
      const id = trigger.getAttribute("data-modal");
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add("is-open");
        document.body.classList.add("modal-open");
      }
    });
  });

  // Close via × button
  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (modal) {
        modal.classList.remove("is-open");
        document.body.classList.remove("modal-open");
      }
    });
  });

  // Close on backdrop click
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        modal.classList.remove("is-open");
        document.body.classList.remove("modal-open");
      }
    });
  });

  // Close on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.is-open").forEach(modal => {
        modal.classList.remove("is-open");
      });
      document.body.classList.remove("modal-open");
    }
  });

  // Docker clipboard (portfolio page)
  const dockerBtn = document.getElementById("copy-docker-code");
  if (dockerBtn) {
    dockerBtn.addEventListener("click", () => {
      const cmd = `git clone https://github.com/palatine-hill-techsupport/STACKED-DECK.git\ncd STACKED-DECK\ndocker-compose up -d\ndocker exec -i mysql_db mysql -u root -proot gamestore < sd_db.sql`;
      navigator.clipboard.writeText(cmd).then(() => {
        dockerBtn.textContent = "Copied!";
        setTimeout(() => { dockerBtn.textContent = "Copy Docker Setup"; }, 2000);
      }).catch(() => { dockerBtn.textContent = "Error"; });
    });
  }
});
