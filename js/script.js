document.addEventListener('DOMContentLoaded', () => {
  // 1. Parameter URL untuk Nama Tamu
  const params = new URLSearchParams(window.location.search);
  const guestName = params.get('to') || params.get('nama');
  if (guestName) {
    const guestDisplay = document.getElementById('guestNameDisplay');
    if (guestDisplay) guestDisplay.textContent = guestName;
  }

  // 2. Kontrol Musik & Buka Undangan
  let isPlaying = false;
  const bgMusic = document.getElementById('bgMusic');
  const cover = document.getElementById('cover');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const btnOpen = document.getElementById('btnOpenInvitation');

  function updateMusicIcon() {
    if (!musicIcon) return;
    if (isPlaying) {
      musicIcon.className = 'fa-solid fa-music spin';
    } else {
      musicIcon.className = 'fa-solid fa-volume-xmark';
    }
  }

  function openInvitation() {
    if (cover) {
      cover.classList.add('open');
    }

    // Eksekusi pemutaran musik secara aman (try-catch promise)
    if (bgMusic) {
      bgMusic.play().then(() => {
        isPlaying = true;
        updateMusicIcon();
      }).catch((err) => {
        console.warn('Audio diblokir browser atau file audio tidak ditemukan:', err);
        isPlaying = false;
        updateMusicIcon();
      });
    }

    if (musicToggle) {
      setTimeout(() => musicToggle.classList.add('visible'), 650);
    }

    setTimeout(() => {
      if (cover) cover.classList.add('hidden-cover');
      document.body.classList.remove('locked');
    }, 1450);
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      updateMusicIcon();
    } else {
      bgMusic.play().then(() => {
        isPlaying = true;
        updateMusicIcon();
      }).catch((err) => {
        console.warn('Gagal memutar lagu:', err);
        isPlaying = false;
        updateMusicIcon();
      });
    }
  }

  if (btnOpen) {
    btnOpen.addEventListener('click', openInvitation);
  }
  
  if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
  }

  // 3. Countdown Timer
  const targetDate = new Date('2026-10-24T08:00:00+07:00').getTime();

  function updateCountdown() {
    const dist = targetDate - Date.now();
    const ids = ['days', 'hours', 'minutes', 'seconds'];
    if (dist <= 0) {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }
    const d = Math.floor(dist / 86400000);
    const h = Math.floor((dist % 86400000) / 3600000);
    const m = Math.floor((dist % 3600000) / 60000);
    const s = Math.floor((dist % 60000) / 1000);

    const elDays = document.getElementById('days');
    const elHours = document.getElementById('hours');
    const elMinutes = document.getElementById('minutes');
    const elSeconds = document.getElementById('seconds');

    if (elDays) elDays.textContent = String(d).padStart(2, '0');
    if (elHours) elHours.textContent = String(h).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(m).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(s).padStart(2, '0');
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 4. Salin Nomor Rekening
  async function copyAccount(targetId, button) {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    const value = targetEl.textContent.replace(/\s+/g, '');
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
      const nameInput = document.getElementById('guestInputName');
      const attendanceInput = document.getElementById('attendanceInput');
      const messageInput = document.getElementById('wishMessage');
      const listEl = document.getElementById('wishesList');

      if (!nameInput || !messageInput || !listEl) return;

      const name = nameInput.value.trim();
      const attendance = attendanceInput ? attendanceInput.value : 'Hadir';
      const message = messageInput.value.trim();

      if (!name || !message) return;

      const item = document.createElement('div');
      item.className = 'bg-[#041f1a]/55 border border-champagne/15 rounded-xl p-4 opacity-0 translate-y-3 transition duration-500';
      const badge = attendance === 'Tidak Hadir' ? 'bg-red-900/40 text-red-200' :
                    attendance === 'Ragu-ragu' ? 'bg-yellow-900/40 text-yellow-100' :
                    'bg-[#135548]/60 text-champagne2';

      item.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <strong class="text-xs sm:text-sm text-champagne2">${escapeHtml(name)}</strong>
          <span class="text-[9px] sm:text-xs ${badge} px-2.5 py-1 rounded-full">${escapeHtml(attendance)}</span>
        </div>
        <p class="text-xs sm:text-sm text-ivory/70 leading-relaxed mt-2">${escapeHtml(message)}</p>
        <span class="block text-[9px] text-ivory/30 mt-2">Baru saja</span>
      `;
      listEl.prepend(item);
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