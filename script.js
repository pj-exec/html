(function () {
  const root = document.documentElement,
    sws = [...document.querySelectorAll(".theme-switch")],
    label = document.getElementById("themeLabel");
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  let saved = null;
  try {
    saved = localStorage.getItem("tp-theme");
  } catch (e) {}
  function apply(mode, persist) {
    root.setAttribute("data-theme", mode);
    const dark = mode === "dark";
    document.body.classList.toggle("is-dark", dark);
    sws.forEach((s) => s.setAttribute("aria-checked", String(dark)));
    label.textContent = dark ? "Dark mode" : "Light mode";
    if (persist) {
      try {
        localStorage.setItem("tp-theme", mode);
      } catch (e) {}
    }
    drawAll();
  }
  sws.forEach((s) =>
    s.addEventListener("click", () =>
      apply(
        document.body.classList.contains("is-dark") ? "light" : "dark",
        true,
      ),
    ),
  );
  // keep the switch in sync if the viewer changes the theme from outside
  new MutationObserver(() => {
    const t = root.getAttribute("data-theme");
    const d = t === "dark" || (!t && mq.matches);
    if (d !== document.body.classList.contains("is-dark"))
      apply(d ? "dark" : "light", false);
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  // Mobile drawer
  const side = document.getElementById("sidebar"),
    btn = document.getElementById("menuBtn"),
    scrim = document.getElementById("scrim");
  function setOpen(o) {
    side.classList.toggle("open", o);
    scrim.hidden = !o;
    btn.setAttribute("aria-expanded", String(o));
  }
  btn.addEventListener("click", () =>
    setOpen(!side.classList.contains("open")),
  );
  scrim.addEventListener("click", () => setOpen(false));
  side
    .querySelectorAll("nav a")
    .forEach((a) => a.addEventListener("click", () => setOpen(false)));

  // Active section highlight
  const links = [...side.querySelectorAll("nav a")];
  const obs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) =>
            l.classList.toggle(
              "active",
              l.getAttribute("href") === "#" + e.target.id,
            ),
          );
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" },
  );
  document.querySelectorAll("main section").forEach((s) => obs.observe(s));

  // Project filters
  const fbtns = document.querySelectorAll(".filters button");
  fbtns.forEach((b) =>
    b.addEventListener("click", () => {
      fbtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const f = b.dataset.f;
      document.querySelectorAll(".proj").forEach((p) => {
        p.hidden = !(f === "all" || p.dataset.cat.split(" ").includes(f));
      });
    }),
  );

  // Copy email
  const cb = document.getElementById("copyBtn"),
    em = document.getElementById("email");
  cb.addEventListener("click", () => {
    const done = () => {
      cb.textContent = "copied ✓";
      setTimeout(() => (cb.textContent = "copy"), 1600);
    };
    const fallback = () => {
      const r = document.createRange();
      r.selectNodeContents(em);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      cb.textContent = "selected";
    };
    try {
      navigator.clipboard.writeText(em.textContent).then(done, fallback);
    } catch (e) {
      fallback();
    }
  });

  // Generative pixel-grid backdrops for project thumbnails
  function drawAll() {
    document.querySelectorAll(".shot canvas").forEach((c) => {
      const r = c.getBoundingClientRect();
      if (!r.width) return;
      const d = window.devicePixelRatio || 1;
      c.width = r.width * d;
      c.height = r.height * d;
      const x = c.getContext("2d");
      x.scale(d, d);
      let seed = +c.dataset.seed * 9301;
      const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      const cs = 14,
        cols = [
          "rgba(255,240,197,.55)",
          "rgba(255,255,255,.25)",
          "rgba(18,49,47,.18)",
          "rgba(255,140,82,.5)",
        ];
      for (let i = 0; i < r.width; i += cs)
        for (let j = 0; j < r.height; j += cs) {
          if (rnd() < 0.22) {
            x.fillStyle = cols[Math.floor(rnd() * cols.length)];
            x.fillRect(i + 1, j + 1, cs - 2, cs - 2);
          }
        }
    });
  }
  window.addEventListener("resize", drawAll);

  const hostTheme = root.getAttribute("data-theme");
  apply(saved || hostTheme || (mq.matches ? "dark" : "light"), false);
  if (!saved)
    mq.addEventListener?.("change", (e) => {
      let s = null;
      try {
        s = localStorage.getItem("tp-theme");
      } catch (_) {}
      if (!s) apply(e.matches ? "dark" : "light", false);
    });
})();

