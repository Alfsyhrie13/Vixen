/* ====== UBAH BAGIAN INI ====== */
const NAMA = "Munaroh";                    // nama dia
const PENGIRIM = "Pengirim Misterius";     // ganti dengan namamu, misal "Budi"
const WA_NUMBER = "";                      // opsional, nomor WA-mu: "6281234567890" (tanpa + dan tanpa 0 di depan)

// isi surat dari Rubi (boleh kamu ubah sesukamu)
const SURAT = `Dear ${NAMA},

Rubi sudah keliling hutan, tapi belum nemu manusia yang bikin ${PENGIRIM} seniat ini buka laptop.

Katanya dia begadang bikin website ini, dan Rubi disuruh jaga supaya nggak error. Rubi sih setuju aja, soalnya dikasih camilan.

Jadi kalau kamu senyum-senyum sekarang, itu bukan salah Rubi ya.

Peluk hangat,
Rubi 🦊`;
/* ============================= */

const steps = [...document.querySelectorAll(".step")];
const ids = steps.map(s => s.dataset.id);
const fox = document.getElementById("foxWindow");
const fill = document.getElementById("progressFill");
let current = 0;
const answers = {};
const plan = {};

// isi nama ke seluruh halaman
document.querySelectorAll("[data-nama]").forEach(el => (el.textContent = NAMA));
document.querySelectorAll("[data-pengirim]").forEach(el => (el.textContent = PENGIRIM));
document.title = `Untuk ${NAMA} 🦊`;

const $ = id => document.getElementById(id);

function animateFox(cls) {
  fox.classList.remove("pop", "wiggle", "jump", "shake");
  void fox.offsetWidth;
  fox.classList.add(cls);
}

/* ---- navigasi ---- */
let stopFns = [];
function go(i) {
  stopFns.forEach(fn => fn());
  stopFns = [];
  current = i;
  steps.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
  fill.style.width = (i / (steps.length - 1)) * 100 + "%";
  fox.classList.toggle("hiding", ids[i] === "intro");
  fox.classList.remove("love");
  window.scrollTo({ top: 0, behavior: "smooth" });
  const hook = hooks[ids[i]];
  if (hook) hook();
}

document.querySelectorAll("[data-next]").forEach(btn =>
  btn.addEventListener("click", () => go(current + 1))
);

/* ---- pilihan umum (verifikasi + kuis) ---- */
document.querySelectorAll(".step").forEach(step => {
  const choices = step.querySelectorAll(".choice");
  if (!choices.length) return;
  const reply = step.querySelector(".reply");
  const gate = step.querySelector("[data-gate]");
  choices.forEach(btn =>
    btn.addEventListener("click", () => {
      choices.forEach(b => b.classList.remove("picked"));
      btn.classList.add("picked");
      reply.textContent = btn.dataset.reply;
      if (btn.dataset.key) answers[btn.dataset.key] = btn.textContent.trim();
      gate.disabled = false;
      animateFox("wiggle");
    })
  );
});

/* ---- game tangkap rubah ---- */
const arena = $("arena");
const catchFox = $("catchFox");
let caught = 0, catchTimer = null, catchSpeed = 1300;

function moveFox() {
  const x = Math.random() * (arena.clientWidth - 64);
  const y = Math.random() * (arena.clientHeight - 64);
  catchFox.style.left = x + "px";
  catchFox.style.top = y + "px";
}
function runCatchTimer() {
  clearInterval(catchTimer);
  catchTimer = setInterval(moveFox, catchSpeed);
}
function startCatch() {
  caught = 0; catchSpeed = 1300;
  catchFox.hidden = false;
  $("catchNext").disabled = true;
  $("catchScore").textContent = "Tertangkap: 0 dari 5";
  moveFox();
  runCatchTimer();
  stopFns.push(() => clearInterval(catchTimer));
}
catchFox.addEventListener("click", () => {
  caught++;
  if (caught >= 5) {
    clearInterval(catchTimer);
    catchFox.hidden = true;
    $("catchScore").textContent = "Semua tertangkap! Mereka langsung minta maaf.";
    $("catchNext").disabled = false;
    animateFox("jump");
    return;
  }
  $("catchScore").textContent = `Tertangkap: ${caught} dari 5`;
  catchSpeed = Math.max(500, catchSpeed - 180);
  moveFox();
  runCatchTimer();
});

/* ---- alat ukur kelucuan ---- */
function startMeter() {
  const bar = $("meterFill"), num = $("meterNum"), text = $("meterText");
  const meter = $("meter"), next = $("meterNext");
  next.disabled = true;
  meter.classList.remove("broken");
  bar.style.transition = "none";
  bar.style.width = "0%";
  num.textContent = "0%";
  text.textContent = "Rubi menyalakan alat ukur kelucuan, tunggu sebentar...";
  let v = 0;
  let after = null;
  const timer = setInterval(() => {
    v += 2;
    bar.style.transition = "width .1s linear";
    bar.style.width = Math.min(v, 100) + "%";
    num.textContent = Math.min(v, 100) + "%";
    if (v >= 100) {
      clearInterval(timer);
      after = setTimeout(() => {
        num.textContent = "9999%";
        meter.classList.add("broken");
        animateFox("shake");
        text.textContent = "Alat ukurnya rusak. Kelucuan " + NAMA + " melebihi kapasitas.";
        next.disabled = false;
      }, 400);
    }
  }, 45);
  stopFns.push(() => { clearInterval(timer); clearTimeout(after); });
}

/* ---- kartu rahasia ---- */
const cardsBox = $("cards");
cardsBox.querySelectorAll(".flip").forEach(card =>
  card.addEventListener("click", () => {
    card.classList.add("open");
    cardsBox.classList.add("chosen");
    $("cardMsg").textContent = card.dataset.msg;
    $("cardNext").disabled = false;
    animateFox("jump");
  })
);

/* ---- surat (efek mesin tik) ---- */
function startLetter() {
  const paper = $("paper"), next = $("letterNext");
  paper.textContent = "";
  paper.classList.add("typing");
  next.disabled = true;
  let i = 0;
  const finish = () => {
    clearInterval(timer);
    paper.textContent = SURAT;
    paper.classList.remove("typing");
    next.disabled = false;
  };
  const timer = setInterval(() => {
    i++;
    paper.textContent = SURAT.slice(0, i);
    if (i >= SURAT.length) finish();
  }, 24);
  paper.onclick = finish;
  stopFns.push(() => clearInterval(timer));
}

/* ---- slider kangen ---- */
const kangen = $("kangen");
kangen.addEventListener("input", () => {
  const v = +kangen.value;
  $("kangenNum").textContent = v + "%";
  $("sliderNext").disabled = v === 0;
  let t;
  if (v <= 20) t = "Biasa aja ya. Rubi pura-pura nggak sedih.";
  else if (v <= 50) t = "Lumayan. Rubi mulai senyum.";
  else if (v <= 80) t = "Kangen banget! Rubi malu-malu.";
  else if (v < 100) t = "Rubi hampir nangis terharu.";
  else t = "Seratus persen. Rubi pingsan sebentar.";
  $("kangenText").textContent = t;
  fox.classList.toggle("love", v > 80);
});

/* ---- ramalan ---- */
const fortuneItems = [...document.querySelectorAll("#fortune li")];
const fortuneBtn = $("fortuneBtn");
let fortuneIdx = 0;
fortuneBtn.addEventListener("click", () => {
  if (fortuneIdx < fortuneItems.length) {
    fortuneItems[fortuneIdx].classList.add("show");
    fortuneIdx++;
    animateFox("wiggle");
    fortuneBtn.textContent = fortuneIdx === fortuneItems.length ? "Lanjut" : "Ramalan berikutnya";
  } else {
    go(current + 1);
  }
});

/* ---- izin bertanya: tombol "Nggak boleh" mengecil ---- */
let askNo = 0;
$("askNo").addEventListener("click", () => {
  askNo++;
  const msgs = ["Hmm, coba pikir lagi.", "Tombolnya makin kecil, lho.", "Rubi pura-pura nggak lihat."];
  if (askNo >= 4) {
    $("askNo").style.display = "none";
    $("askYes").style.transform = "scale(1.15)";
    $("askReply").textContent = "Tombolnya habis. Rubi anggap boleh.";
  } else {
    $("askNo").style.transform = `scale(${1 - askNo * 0.22})`;
    $("askReply").textContent = msgs[askNo - 1];
  }
  animateFox("shake");
});

/* ---- pertanyaan utama ---- */
const box = $("finalBox");
const noBtn = $("noBtn"), yesBtn = $("yesBtn"), thinkBtn = $("thinkBtn");
const dodgeText = $("dodgeText");
const excuses = [
  "Tombolnya licin, maaf.",
  "Coba lagi? Rubi bilang tombolnya lagi nggak mau.",
  "Hampir kena!",
  "Rubi mulai ngakak.",
  "Tombol Nggak lagi cuti.",
  "Rubi taruhan kamu bakal nyerah sebentar lagi.",
  "Tinggal sedikit lagi...",
  "Rubi mulai kasihan sama jarimu.",
];
let dodges = 0, converted = false;

function dodge(e) {
  if (converted) return;
  if (e && e.cancelable) e.preventDefault();
  dodges++;
  if (dodges > excuses.length) {
    converted = true;
    noBtn.textContent = "Iya deh";
    dodgeText.textContent = "Nah gitu dong.";
    return;
  }
  const w = noBtn.offsetWidth, h = noBtn.offsetHeight;
  const x = w / 2 + Math.random() * (box.clientWidth - w);
  const y = 70 + Math.random() * Math.max(0, box.clientHeight - h - 70);
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
  dodgeText.textContent = excuses[dodges - 1];
  yesBtn.style.setProperty("--yes-scale", 1 + dodges * 0.06);
  animateFox("wiggle");
}
noBtn.addEventListener("pointerenter", dodge);
noBtn.addEventListener("pointerdown", dodge);
noBtn.addEventListener("click", () => { if (converted) go(current + 1); });
yesBtn.addEventListener("click", () => go(current + 1));

// "Mikir dulu": hitung mundur, lalu otomatis jadi "Mau"
thinkBtn.addEventListener("click", () => {
  thinkBtn.disabled = true;
  let n = 3;
  dodgeText.textContent = "Rubi kasih waktu mikir. 3...";
  const t = setInterval(() => {
    n--;
    if (n > 0) {
      dodgeText.textContent = `Rubi kasih waktu mikir. ${n}...`;
    } else {
      clearInterval(t);
      dodgeText.textContent = "Waktu habis. Jawaban otomatis: Mau.";
      setTimeout(() => go(current + 1), 1300);
    }
  }, 1000);
});

/* ---- rencana ---- */
const planSend = $("planSend");
document.querySelectorAll(".pills").forEach(group => {
  group.querySelectorAll(".pill").forEach(pill =>
    pill.addEventListener("click", () => {
      group.querySelectorAll(".pill").forEach(p => p.classList.remove("picked"));
      pill.classList.add("picked");
      plan[group.dataset.key] = pill.textContent.trim();
      planSend.disabled = !(plan.tempat && plan.waktu);
    })
  );
});
planSend.addEventListener("click", () => go(current + 1));

/* ---- konfeti ---- */
function confetti() {
  const wrap = $("confetti");
  const icons = ["🧡", "🦊", "🍑", "✨", "🍊"];
  for (let i = 0; i < 45; i++) {
    const s = document.createElement("span");
    s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
    s.style.animationDelay = Math.random() * 0.8 + "s";
    wrap.appendChild(s);
  }
  setTimeout(() => (wrap.innerHTML = ""), 6500);
}

/* ---- aksi tiap layar ---- */
const hooks = {
  hello: () => animateFox("pop"),
  verify: () => animateFox("wiggle"),
  cert: () => animateFox("jump"),
  qresult: () => {
    $("qResult").textContent =
      `Buktinya: ketemu rubah kamu pilih "${answers.a1}", camilanmu "${answers.a2}", dan warna favoritmu "${answers.a3}". Kombinasi langka, Rubi baru lihat sekali seumur hidup.`;
    animateFox("jump");
  },
  catch: startCatch,
  meter: startMeter,
  cards: () => animateFox("wiggle"),
  letter: startLetter,
  final: () => animateFox("wiggle"),
  end: () => {
    $("summaryPlan").textContent = `${plan.tempat}, ${plan.waktu}`;
    if (WA_NUMBER) {
      const pesan = `Halo ${PENGIRIM}, ini ${NAMA}. Jawabanku: mau! Rencananya ${plan.tempat}, ${plan.waktu}. Rubi yang nyuruh aku jawab 🦊`;
      const wa = $("waBtn");
      wa.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`;
      wa.hidden = false;
      $("endHint").textContent = "Pencet tombol WhatsApp di bawah, atau screenshot layar ini.";
    }
    animateFox("jump");
    confetti();
  },
};

$("replay").addEventListener("click", () => location.reload());

go(0);
