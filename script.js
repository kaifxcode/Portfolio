/* =========================================================
   Dragon & Sakura Portfolio — script.js
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
  };

  /* ---------- Preloader (with a safety timeout) ---------- */
  const preloader = $("#preloader");
  const hidePreloader = () => preloader.classList.add("done");
  window.addEventListener("load", () => setTimeout(hidePreloader, 1200));
  setTimeout(hidePreloader, 5000);

  /* ---------- Year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Avatar fallback ---------- */
  const avatar = $(".avatar"), avatarImg = $("img", avatar);
  const avatarFail = () => { avatarImg.remove(); avatar.textContent = "S"; };
  if (avatarImg.complete && avatarImg.naturalWidth === 0) avatarFail();
  avatarImg.addEventListener("error", avatarFail);

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
    c = Math.max(0, c + (deleting ? -1 : 1));
    setTimeout(type, delay);
  }
  if (reduceMotion) typedEl.textContent = roles[0]; else type();

  /* ---------- Navbar: scroll state, progress, active link, back-to-top ---------- */
  const nav = $("#nav"), progress = $("#progress"), toTop = $("#toTop");
  const links = $$(".nav__links a");
  const sections = links.map(a => $(a.getAttribute("href")));
  let ticking = false;

  function onScroll() {
    ticking = false;
    const y = scrollY;
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - innerHeight, 1);
    progress.style.width = (y / max) * 100 + "%";
    nav.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);

    let current = 0;
    sections.forEach((sec, i) => { if (sec.offsetTop - 200 <= y) current = i; });
    if (innerHeight + y >= doc.scrollHeight - 4) current = sections.length - 1; // bottom of page = last link
    links.forEach((a, i) => a.classList.toggle("active", i === current));
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger"), navLinks = $("#navLinks");
  function setMenu(open) {
    burger.classList.toggle("open", open);
    navLinks.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.classList.toggle("menu-open", open);
  }
  burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  links.forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  addEventListener("resize", () => { if (innerWidth > 760) setMenu(false); });

  /* ---------- Reveal on scroll + skill bars ---------- */
  function reveal(el) {
    el.classList.add("show");
    if (el.classList.contains("skill")) $("i", el).style.width = el.dataset.level + "%";
    io.unobserve(el);
    setTimeout(() => { el.style.transitionDelay = ""; }, 1500); // so hover/tilt isn't delayed afterwards
  }
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && reveal(e.target)), { threshold: 0.15 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 6) * 0.07 + "s"; io.observe(el); });

  /* ---------- Counters ---------- */
  const counterIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count;
    counterIO.unobserve(el);
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now(), dur = 1600;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach(el => counterIO.observe(el));

  /* ---------- Parallax background + cursor glow (mouse devices only) ---------- */
  const bgImage = $("#bgImage"), glow = $("#cursorGlow");
  if (canHover) {
    addEventListener("mousemove", e => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      if (reduceMotion) return;
      const x = (e.clientX / innerWidth - 0.5) * -26, y = (e.clientY / innerHeight - 0.5) * -26;
      bgImage.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ---------- 3D tilt on project cards ---------- */
  $$(".tilt").forEach(card => {
    card.addEventListener("mousemove", e => {
      if (reduceMotion || innerWidth < 900) return;
      const b = card.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });

  /* ---------- Project filter (a project can have several categories) ---------- */
  const chips = $$(".chip"), projects = $$(".project");
  chips.forEach(ch => ch.setAttribute("aria-pressed", ch.classList.contains("active")));
  chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(x => { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
    chip.classList.add("active");
    chip.setAttribute("aria-pressed", "true");
    const f = chip.dataset.filter;
    projects.forEach(p => {
      const match = f === "all" || p.dataset.cat.split(" ").includes(f);
      p.classList.toggle("hide", !match);
      if (!match) return;
      io.unobserve(p);
      p.style.transitionDelay = "";
      p.classList.add("show"); // fixes cards staying invisible if they were filtered out before being revealed
      if (!reduceMotion) { p.classList.remove("pop"); void p.offsetWidth; p.classList.add("pop"); }
    });
  }));

  /* =========================================================
     Music player (Spotify / Apple Music style)
     ========================================================= */
  const audio = new Audio();
  audio.preload = "metadata";
  const player = $("#player"), mini = $("#mini");
  const el = id => document.getElementById(id);
  const nowTitle = el("nowTitle"), nowArtist = el("nowArtist"), curTime = el("curTime"), durTime = el("durTime");
  const seek = el("seek"), volume = el("volume"), statusEl = el("playerStatus");
  const playBtns = [el("playBtn"), el("miniPlay")];
  const shuffleBtn = el("shuffleBtn"), repeatBtn = el("repeatBtn"), likeBtn = el("likeBtn"), muteBtn = el("muteBtn");

  const tracks = $$("#playlist .track").map(btn => ({
    btn, title: btn.dataset.title, artist: btn.dataset.artist, src: btn.dataset.src,
    c1: btn.dataset.c1, c2: btn.dataset.c2, durEl: $(".track__dur", btn), dur: 0,
  }));
  let index = 0, history = [], shuffle = store.get("shuffle", false), repeat = store.get("repeat", "off");
  let wantPlay = false, started = false, seeking = false, musicInView = false, errorStreak = 0, statusTimer;
  const liked = new Set(store.get("liked", []));
  const REPEAT_MODES = ["off", "all", "one"];

  const fmt = t => (isFinite(t) && t > 0) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}` : "0:00";
  const setFill = (node, pct) => node.style.setProperty("--pct", pct + "%");
  function showStatus(msg) {
    statusEl.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.textContent = ""; }, 4500);
  }

  tracks.forEach((t, i) => {
    t.btn.style.setProperty("--c1", t.c1);
    t.btn.style.setProperty("--c2", t.c2);
    t.btn.addEventListener("click", () => (i === index ? toggle() : load(i, true)));
    // read each song's length so the list can show it
    const probe = new Audio();
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", () => {
      t.dur = probe.duration;
      t.durEl.textContent = fmt(t.dur);
      if (i === index) durTime.textContent = fmt(t.dur);
    });
    probe.src = t.src;
  });

  function load(i, autoplay = false, record = true) {
    if (record && started && i !== index) history.push(index);
    index = i;
    const t = tracks[i];
    tracks.forEach((x, k) => { x.btn.classList.toggle("active", k === i); x.btn.setAttribute("aria-current", k === i); });
    nowTitle.textContent = $("#miniTitle").textContent = t.title;
    nowArtist.textContent = $("#miniArtist").textContent = t.artist;
    [player, mini].forEach(n => { n.style.setProperty("--c1", t.c1); n.style.setProperty("--c2", t.c2); });
    seek.value = 0; setFill(seek, 0); setFill(mini, 0);
    curTime.textContent = "0:00";
    durTime.textContent = t.dur ? fmt(t.dur) : "0:00";
    seek.disabled = true;
    likeUI();
    audio.src = t.src;
    mediaMeta();
    wantPlay = autoplay;
    if (autoplay) play();
  }

  async function play() {
    wantPlay = true;
    started = true;
    try { await audio.play(); } catch (err) {
      if (err.name !== "AbortError") showStatus("Couldn't play this song. Check your connection or try another.");
    }
    updateMini();
  }
  function toggle() { if (audio.paused) play(); else { wantPlay = false; audio.pause(); } }

  const pickNext = () => {
    if (shuffle && tracks.length > 1) { let n; do { n = Math.floor(Math.random() * tracks.length); } while (n === index); return n; }
    return (index + 1) % tracks.length;
  };
  const next = () => load(pickNext(), true);
  function prev() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    load(history.length ? history.pop() : (index - 1 + tracks.length) % tracks.length, true, false);
  }

  /* audio events */
  function setPlayingUI(on) {
    [player, mini].forEach(n => n.classList.toggle("playing", on));
    tracks.forEach((t, k) => t.btn.classList.toggle("is-playing", on && k === index));
    playBtns.forEach(b => b.setAttribute("aria-label", on ? "Pause" : "Play"));
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = on ? "playing" : "paused";
  }
  audio.addEventListener("play", () => setPlayingUI(true));
  audio.addEventListener("pause", () => setPlayingUI(false));
  audio.addEventListener("waiting", () => player.classList.add("buffering"));
  audio.addEventListener("playing", () => { player.classList.remove("buffering"); errorStreak = 0; });
  audio.addEventListener("canplay", () => player.classList.remove("buffering"));
  const onDuration = () => {
    const ok = isFinite(audio.duration) && audio.duration > 0;
    seek.disabled = !ok;
    if (ok) { tracks[index].dur = audio.duration; tracks[index].durEl.textContent = durTime.textContent = fmt(audio.duration); }
  };
  audio.addEventListener("loadedmetadata", onDuration);
  audio.addEventListener("durationchange", onDuration);
  audio.addEventListener("timeupdate", () => {
    const d = audio.duration;
    if (!isFinite(d) || !d) return;
    const pct = (audio.currentTime / d) * 100;
    setFill(mini, pct);
    if (seeking) return;
    seek.value = pct * 10; setFill(seek, pct);
    curTime.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener("ended", () => {
    if (repeat === "one") { audio.currentTime = 0; play(); return; }
    if (!shuffle && index === tracks.length - 1 && repeat === "off") { audio.currentTime = 0; wantPlay = false; return; }
    next();
  });
  audio.addEventListener("error", () => {
    player.classList.remove("buffering");
    showStatus("This song couldn't be loaded.");
    if (wantPlay && ++errorStreak < tracks.length) setTimeout(next, 800); // skip broken songs, but never loop forever
  });

  /* seek bar */
  seek.addEventListener("input", () => {
    seeking = true;
    setFill(seek, seek.value / 10);
    curTime.textContent = fmt((audio.duration || 0) * seek.value / 1000);
  });
  seek.addEventListener("change", () => {
    if (isFinite(audio.duration)) audio.currentTime = (audio.duration * seek.value) / 1000;
    seeking = false;
  });

  /* volume + mute */
  function volumeUI() {
    const off = audio.muted || audio.volume === 0;
    muteBtn.classList.toggle("muted", off);
    muteBtn.setAttribute("aria-label", off ? "Unmute" : "Mute");
    setFill(volume, (off ? 0 : audio.volume) * 100);
  }
  audio.volume = Math.min(1, Math.max(0, +store.get("vol", 0.8)));
  volume.value = audio.volume;
  volume.addEventListener("input", () => { audio.muted = false; audio.volume = +volume.value; store.set("vol", audio.volume); volumeUI(); });
  muteBtn.addEventListener("click", () => { audio.muted = !audio.muted; volumeUI(); });
  volumeUI();

  /* shuffle / repeat / like */
  function modesUI() {
    shuffleBtn.classList.toggle("on", shuffle);
    shuffleBtn.setAttribute("aria-pressed", shuffle);
    repeatBtn.dataset.mode = repeat;
    repeatBtn.classList.toggle("on", repeat !== "off");
    repeatBtn.setAttribute("aria-label", "Repeat: " + repeat);
  }
  shuffleBtn.addEventListener("click", () => { shuffle = !shuffle; store.set("shuffle", shuffle); modesUI(); });
  repeatBtn.addEventListener("click", () => {
    repeat = REPEAT_MODES[(REPEAT_MODES.indexOf(repeat) + 1) % REPEAT_MODES.length];
    store.set("repeat", repeat); modesUI();
  });
  function likeUI() {
    const on = liked.has(tracks[index].title);
    likeBtn.classList.toggle("on", on);
    likeBtn.setAttribute("aria-pressed", on);
    likeBtn.setAttribute("aria-label", on ? "Remove from liked songs" : "Like this song");
  }
  likeBtn.addEventListener("click", () => {
    const t = tracks[index].title;
    liked.has(t) ? liked.delete(t) : liked.add(t);
    store.set("liked", [...liked]); likeUI();
  });
  modesUI();

  /* buttons */
  playBtns.forEach(b => b.addEventListener("click", toggle));
  [el("prevBtn"), el("miniPrev")].forEach(b => b.addEventListener("click", prev));
  [el("nextBtn"), el("miniNext")].forEach(b => b.addEventListener("click", next));
  el("miniGo").addEventListener("click", () => $("#music").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }));

  /* small keyboard shortcuts while focus is inside the Music section */
  $("#music").addEventListener("keydown", e => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
    else if (e.key === "ArrowLeft") audio.currentTime = Math.max(audio.currentTime - 5, 0);
    else if (e.key.toLowerCase() === "m") { audio.muted = !audio.muted; volumeUI(); }
  });

  /* mini player appears once music has started and the Music section is off screen */
  function updateMini() {
    const show = started && !musicInView;
    mini.classList.toggle("show", show);
    document.body.classList.toggle("mini-on", show);
  }
  new IntersectionObserver(es => { musicInView = es[0].isIntersecting; updateMini(); }, { threshold: 0.05 }).observe($("#music"));

  /* lock-screen / headphone controls */
  function mediaMeta() {
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    const t = tracks[index];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title, artist: t.artist, album: "Sid's Top Tracks",
      artwork: [{ src: "favicon.png", sizes: "512x512", type: "image/png" }],
    });
  }
  if ("mediaSession" in navigator) {
    const set = (a, fn) => { try { navigator.mediaSession.setActionHandler(a, fn); } catch { /* unsupported */ } };
    set("play", play);
    set("pause", () => { wantPlay = false; audio.pause(); });
    set("previoustrack", prev);
    set("nexttrack", next);
  }

  load(0); // show the first song (the intro song) in the player right away

  /* ---------- Intro screen: the click lets the browser play the intro song ---------- */
  const intro = $("#intro");
  const closeIntro = () => {
    intro.classList.add("hide");
    document.body.classList.remove("intro-open");
    try { sessionStorage.setItem("introSeen", "1"); } catch { /* storage blocked */ }
  };
  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem("introSeen") === "1"; } catch { /* storage blocked */ }
  if (seenIntro) closeIntro(); else document.body.classList.add("intro-open");
  $("#introSound").addEventListener("click", () => { load(0, true); closeIntro(); });
  $("#introSkip").addEventListener("click", closeIntro);
  addEventListener("keydown", e => { if (e.key === "Escape" && !intro.classList.contains("hide")) closeIntro(); });

  /* ---------- Contact form (opens email app) ---------- */
  const form = $("#contactForm"), note = $("#formNote");
  const MY_EMAIL = "kaifmansuri986@gmail.com"; // <-- change to your email

  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = encodeURIComponent(`Portfolio message from ${d.get("name")}`);
    const body = encodeURIComponent(`${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`);
    location.href = `mailto:${MY_EMAIL}?subject=${subject}&body=${body}`;
    // the form is NOT cleared, so nothing is lost if no email app opens
    note.textContent = "Opening your email app… if nothing opens, use the “Copy email” button. 🌸";
    setTimeout(() => { note.textContent = ""; }, 9000);
  });

  const copyBtn = $("#copyEmail");
  copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(MY_EMAIL); copyBtn.textContent = "Copied ✓"; }
    catch { copyBtn.textContent = MY_EMAIL; }
    setTimeout(() => { copyBtn.textContent = "Copy email"; }, 2000);
  });

  /* ---------- Sakura petals canvas ---------- */
  const canvas = $("#petals"), ctx = canvas.getContext("2d");
  let W, H;
  const COUNT = innerWidth < 700 ? 22 : 45;
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  addEventListener("resize", resize);
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
  const petals = Array.from({ length: COUNT }, () => new Petal(true));
  function animate() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  if (!reduceMotion) animate();
})();
