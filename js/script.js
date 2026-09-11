document.addEventListener('DOMContentLoaded', () => {
  // 1. Parameter URL untuk Nama Tamu
  const params = new URLSearchParams(window.location.search);
  const guestName = params.get('to') || params.get('nama');
  if (guestName) {
    document.getElementById('guestNameDisplay').textContent = guestName;
  }

  // 2. Kontrol Musik & Buka Undangan
  let isPlaying = false;
  const bgMusic = document.getElementById('bgMusic');
  const cover = document.getElementById('cover');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const btnOpen = document.getElementById('btnOpenInvitation');

  // Fungsi memperbarui ikon & animasi rotasi
  function updateMusicIcon() {
    if (isPlaying) {
      // Musik berbunyi: ikon nada & berputar
      musicIcon.className = 'fa-solid fa-music spin';
    } else {
      // Musik pause/mute: ikon speaker silang & berhenti berputar
      musicIcon.className = 'fa-solid fa-volume-xmark';
    }
  }

  function openInvitation() {
    cover.classList.add('open');

    // Memutar musik saat tombol Buka Undangan diklik
    bgMusic.play().then(() => {
      isPlaying = true;
      updateMusicIcon();
    }).catch((err) => {
      console.log('Autoplay diblokir browser atau error:', err);
      isPlaying = false;
      updateMusicIcon();
    });

    setTimeout(() => musicToggle.classList.add('visible'), 650);
    setTimeout(() => {
      cover.classList.add('hidden-cover');
      document.body.classList.remove('locked');
    }, 1450);
  }

  // PERBAIKAN PADA FUNGSI TOGGLE MUSIK
  function toggleMusic() {
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      updateMusicIcon(); // Langsung ganti ikon ke mute/tersilang
    } else {
      bgMusic.play().then(() => {
        isPlaying = true;
        updateMusicIcon(); // Ganti ikon ke berputar saat lagu dikonfirmasi mulai berjalan
      }).catch((err) => {
        console.log('Gagal memutar audio:', err);
        isPlaying = false;
        updateMusicIcon();
      });
    }
  }

  if (btnOpen) btnOpen.addEventListener('click', openInvitation);
  if (musicToggle) musicToggle.addEventListener('click', toggleMusic);

  // 3. Countdown Timer
  const targetDate = new Date('2026-10-24T08:00:00+07:00').getTime();

  function updateCountdown() {
    const dist = targetDate - Date.now();
    const ids = ['days', 'hours', 'minutes', 'seconds'];
    if (dist <= 0) {
      ids.forEach(id => document.getElementById(id).textContent = '00');
      return;
    }
    const d = Math.floor(dist / 86400000);
    const h = Math.floor((dist % 86400000) / 3600000);
    const m = Math.floor((dist % 3600000) / 60000);
    const s = Math.floor((dist % 60000) / 1000);

    document.getElementById('days').textContent = String(d).padStart(2, '0');
    document.getElementById('hours').textContent = String(h).padStart(2, '0');
    document.getElementById('minutes').textContent = String(m).padStart(2, '0');
    document.getElementById('seconds').textContent = String(s).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 4. Salin Nomor Rekening
  async function copyAccount(targetId, button) {
    const value = document.getElementById(targetId).textContent.replace(/\s+/g, '');
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      const input = document.createElement('input');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    const oldHtml = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Tersalin';
    setTimeout(() => button.innerHTML = oldHtml, 1600);
  }

  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      copyAccount(targetId, this);
    });
  });

  // 5. Form RSVP / Kirim Ucapan
  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
  }

  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('guestInputName').value.trim();
      const attendance = document.getElementById('attendanceInput').value;
      const message = document.getElementById('wishMessage').value.trim();
      if (!name || !message) return;

      const item = document.createElement('div');
      item.className = 'bg-[#041f1a]/55 border border-champagne/15 rounded-xl p-4 opacity-0 translate-y-3 transition duration-500';
      const badge = attendance === 'Tidak Hadir' ? 'bg-red-900/40 text-red-200' :
                    attendance === 'Ragu-ragu' ? 'bg-yellow-900/40 text-yellow-100' :
                    'bg-[#135548]/60 text-champagne2';

      item.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <strong class="text-xs text-champagne2">${escapeHtml(name)}</strong>
          <span class="text-[9px] ${badge} px-2 py-1 rounded-full">${escapeHtml(attendance)}</span>
        </div>
        <p class="text-xs text-ivory/70 leading-relaxed mt-2">${escapeHtml(message)}</p>
        <span class="block text-[9px] text-ivory/30 mt-2">Baru saja</span>
      `;
      document.getElementById('wishesList').prepend(item);
      setTimeout(() => item.classList.remove('opacity-0', 'translate-y-3'), 30);
      rsvpForm.reset();
    });
  }

  // 6. Scroll Intersection Observer (Elemen Reveal)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
});