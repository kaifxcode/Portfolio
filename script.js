/* =========================================================
   Dragon & Sakura Portfolio — script.js
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    setTimeout(() => $("#preloader").classList.add("done"), 1500);
  });

  /* ---------- Year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Typing effect ---------- */
  const roles = ["Web Developer", "UI / UX Designer", "Creative Coder", "Music Lover", "Anime Enthusiast"];
  const typedEl = $("#typed");
  let r = 0, c = 0, deleting = false;

  function type() {
    const word = roles[r];
    typedEl.textContent = word.slice(0, c);
    let delay = deleting ? 45 : 95;

    if (!deleting && c === word.length) { deleting = true; delay = 1500; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 400; }
    c += deleting ? -1 : 1;
    if (c < 0) c = 0;
    setTimeout(type, delay);
  }
  type();

  /* ---------- Navbar: scroll state, progress, active link, back-to-top ---------- */
  const nav = $("#nav");
  const progress = $("#progress");
  const toTop = $("#toTop");
  const links = $$(".nav__links a");
  const sections = links.map(a => $(a.getAttribute("href")));

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (y / max) * 100 + "%";
    nav.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);

    let current = 0;
    sections.forEach((sec, i) => { if (sec.offsetTop - 200 <= y) current = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === current));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  const closeMenu = () => { burger.classList.remove("open"); navLinks.classList.remove("open"); };
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  links.forEach(a => a.addEventListener("click", closeMenu));

  /* ---------- Reveal on scroll + skill bars + counters ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("show");
      setTimeout(() => { el.style.transitionDelay = ""; }, 1300);

      if (el.classList.contains("skill")) {
        $("i", el).style.width = el.dataset.level + "%";
      }
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  $$(".reveal").forEach((el, i) => {
    // small stagger for siblings
    el.style.transitionDelay = (i % 6) * 0.07 + "s";
    io.observe(el);
  });

  // Counters
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const start = performance.now();
      const dur = 1600;
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => counterIO.observe(el));

  /* ---------- Parallax background + cursor glow ---------- */
  const bgImage = $("#bgImage");
  const glow = $("#cursorGlow");

  window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
    if (reduceMotion) return;
    const x = (e.clientX / window.innerWidth - 0.5) * -26;
    const y = (e.clientY / window.innerHeight - 0.5) * -26;
    bgImage.style.transform = `translate(${x}px, ${y}px)`;
  });

  /* ---------- 3D tilt on project cards ---------- */
  $$(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (reduceMotion || window.innerWidth < 900) return;
      const b = card.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width - 0.5;
      const py = (e.clientY - b.top) / b.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });

  /* ---------- Project filter + swipe dots ---------- */
  const chips = $$(".chip");
  const projects = $$(".project");
  const track = $("#projects-grid");
  const dots = document.createElement("div");
  dots.className = "dots";
  track.after(dots);
  const visible = () => projects.filter(p => !p.classList.contains("hide"));

  function markDot() {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bd = 1e9;
    visible().forEach((p, i) => {
      const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    [...dots.children].forEach((d, i) => d.classList.toggle("on", i === best));
  }
  function buildDots() {
    const vis = visible();
    dots.innerHTML = vis.map(() => "<i></i>").join("");
    [...dots.children].forEach((d, i) => d.addEventListener("click", () =>
      vis[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })));
    markDot();
  }
  track.addEventListener("scroll", markDot, { passive: true });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      projects.forEach((p) => {
        const match = f === "all" || p.dataset.cat === f;
        p.classList.toggle("hide", !match);
        if (match) { p.classList.add("show"); p.style.opacity = 0; requestAnimationFrame(() => requestAnimationFrame(() => { p.style.opacity = 1; })); }
      });
      track.scrollLeft = 0;
      buildDots();
    });
  });
  buildDots();

  /* ---------- Music player (Spotify / Apple Music style) ---------- */
  const player = $("#player"), seek = $("#seek"), cover = $("#cover"), mini = $("#mini");
  const nowTitle = $("#nowTitle"), nowArtist = $("#nowArtist"), tCur = $("#tCur"), tDur = $("#tDur");
  const items = $$("#playlist li"), list = $("#playlist");
  const audioFiles = ["https://audio.jukehost.co.uk/01a1973c-fc8f-7231-9a12-8647d104f235", "https://audio.jukehost.co.uk/01a1973c-fcf6-725b-b44f-45668e567d1c", "https://audio.jukehost.co.uk/01a1973c-fb40-71bb-b927-e06459c69962", "https://audio.jukehost.co.uk/01a1975c-2090-73bb-9e7b-9d991b1069e2", "https://audio.jukehost.co.uk/01a1975c-36e7-737f-996b-20e8efe2906d"];
  const art = [["#ff5c9d", "#6a3df0"], ["#3b5bdb", "#4fe3a1"], ["#ff8fb8", "#e0a040"], ["#2fae7d", "#1b2a7a"], ["#7aa2ff", "#ff5c9d"]];
  const audio = new Audio();
  audio.preload = "metadata";
  let cur = 0, playing = false, dragging = false, inView = true, started = false, shuffle = false, repeat = "all";
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00";
  const paint = p => seek.style.setProperty("--p", p * 100 + "%");

  items.forEach((li, i) => {
    li.querySelector("i").innerHTML = "<s></s><s></s><s></s>";
    li.tabIndex = 0;
    li.addEventListener("click", () => (i === cur ? toggle() : setTrack(i, true)));
    li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); } });
  });

  const syncMini = () => mini.classList.toggle("show", started && !inView);
  function setState(s) {
    playing = s;
    if (s) started = true;
    player.classList.toggle("playing", s);
    list.classList.toggle("on", s);
    document.body.classList.toggle("is-playing", s);
    syncMini();
  }
  function play() { audio.play().then(() => setState(true)).catch(() => setState(false)); }
  function pause() { audio.pause(); setState(false); }
  function toggle() { playing ? pause() : play(); }

  function setTrack(i, autoplay = playing) {
    cur = (i + items.length) % items.length;
    const li = items[cur], [c1, c2] = art[cur % art.length];
    items.forEach((x, k) => x.classList.toggle("active", k === cur));
    nowTitle.textContent = $("#miniTitle").textContent = li.dataset.title;
    nowArtist.textContent = $("#miniArtist").textContent = $("#coverArtist").textContent = li.dataset.artist;
    $("#coverGlyph").textContent = li.dataset.title.charAt(0);
    [player, mini].forEach(el => { el.style.setProperty("--accent", c1); el.style.setProperty("--c1", c1); el.style.setProperty("--c2", c2); });
    audio.src = audioFiles[cur];
    seek.value = 0; paint(0); tCur.textContent = "0:00"; tDur.textContent = "0:00";
    if ("mediaSession" in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: li.dataset.title, artist: li.dataset.artist });
    if (autoplay) play();
  }
  function next() {
    let n = cur + 1;
    if (shuffle && items.length > 1) { do { n = Math.floor(Math.random() * items.length); } while (n === cur); }
    setTrack(n);
  }
  const prev = () => (audio.currentTime > 4 ? (audio.currentTime = 0) : setTrack(cur - 1));

  ["playBtn", "miniPlay"].forEach(id => $("#" + id).addEventListener("click", toggle));
  ["nextBtn", "miniNext"].forEach(id => $("#" + id).addEventListener("click", next));
  ["prevBtn", "miniPrev"].forEach(id => $("#" + id).addEventListener("click", prev));
  cover.addEventListener("click", toggle);
  $("#miniInfo").addEventListener("click", () => $("#music").scrollIntoView({ behavior: "smooth" }));

  $("#shuffleBtn").addEventListener("click", e => {
    shuffle = !shuffle;
    e.currentTarget.classList.toggle("on", shuffle);
    e.currentTarget.setAttribute("aria-pressed", shuffle);
  });
  $("#repeatBtn").addEventListener("click", e => {
    const modes = ["all", "one", "off"], b = e.currentTarget;
    repeat = modes[(modes.indexOf(repeat) + 1) % 3];
    b.dataset.mode = repeat;
    b.classList.toggle("on", repeat !== "off");
    b.setAttribute("aria-label", "Repeat " + repeat);
  });

  const vol = $("#vol");
  vol.addEventListener("input", () => { audio.volume = vol.value / 100; audio.muted = false; vol.style.setProperty("--p", vol.value + "%"); $("#muteBtn").classList.remove("off"); });
  $("#muteBtn").addEventListener("click", e => { audio.muted = !audio.muted; e.currentTarget.classList.toggle("off", audio.muted); });
  vol.style.setProperty("--p", "100%");

  audio.addEventListener("loadedmetadata", () => { tDur.textContent = fmt(audio.duration); });
  audio.addEventListener("ended", () => {
    if (repeat === "one") { audio.currentTime = 0; play(); }
    else if (repeat === "off" && !shuffle && cur === items.length - 1) { setTrack(0, false); pause(); }
    else if (shuffle) next();
    else setTrack(cur + 1, true);
  });
  seek.addEventListener("input", () => { dragging = true; paint(seek.value / 1000); if (audio.duration) tCur.textContent = fmt(seek.value / 1000 * audio.duration); });
  seek.addEventListener("change", () => { if (audio.duration) audio.currentTime = seek.value / 1000 * audio.duration; dragging = false; });
  if ("mediaSession" in navigator) {
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", play); ms.setActionHandler("pause", pause);
    ms.setActionHandler("previoustrack", prev); ms.setActionHandler("nexttrack", next);
  }
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; syncMini(); }, { threshold: 0.1 }).observe(player);

  (function tick() {
    if (playing && audio.duration) {
      const p = audio.currentTime / audio.duration;
      $("#miniBar").style.transform = `scaleX(${p})`;
      if (!dragging) { seek.value = p * 1000; paint(p); tCur.textContent = fmt(audio.currentTime); }
    }
    requestAnimationFrame(tick);
  })();
  setTrack(0, false);

  /* ---------- Contact form (opens email app) ---------- */
  const form = $("#contactForm");
  const note = $("#formNote");
  const MY_EMAIL = "kaifmansuri986@gmail.com"; // <-- change to your email

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = encodeURIComponent(`Portfolio message from ${d.get("name")}`);
    const body = encodeURIComponent(`${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`);
    window.location.href = `mailto:${MY_EMAIL}?subject=${subject}&body=${body}`;
    note.textContent = "Opening your email app… thank you! 🌸";
    form.reset();
  });

  /* ---------- Sakura petals canvas ---------- */
  const canvas = $("#petals");
  const ctx = canvas.getContext("2d");
  let W, H, petals = [];
  const COUNT = window.innerWidth < 700 ? 22 : 45;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Petal {
    constructor(initial) { this.reset(initial); }
    reset(initial = false) {
      this.x = Math.random() * W * 1.2 - W * 0.1;
      this.y = initial ? Math.random() * H : -20;
      this.size = 5 + Math.random() * 9;
      this.speedY = 0.5 + Math.random() * 1.1;
      this.speedX = 0.3 + Math.random() * 0.9;
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.01 + Math.random() * 0.02;
      this.alpha = 0.5 + Math.random() * 0.5;
      this.hue = Math.random() > 0.3 ? "255,150,195" : "255,205,225";
    }
    update() {
      this.sway += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.sway) * 0.8;
      this.y += this.speedY;
      this.rot += this.rotSpeed;
      if (this.y > H + 20 || this.x > W + 30) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = `rgba(${this.hue},1)`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size, -this.size, this.size * 1.6, this.size * 0.6, 0, this.size * 1.4);
      ctx.bezierCurveTo(-this.size * 1.6, this.size * 0.6, -this.size, -this.size, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  petals = Array.from({ length: COUNT }, () => new Petal(true));

  function animate() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  if (!reduceMotion) animate();
})();
