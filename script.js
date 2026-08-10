/* =====================================================================
   DO SPORTS ACADEMY — interactions
   ===================================================================== */

/* ---------- Sticky header state (transparent over hero → solid) ---------- */
const header = document.querySelector('[data-header]');
if (header) {
  const onScroll = () => {
    header.classList.toggle('is-solid', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile slide-in drawer ---------- */
const menuButton = document.querySelector('[data-menu]');
const menuClose = document.querySelector('[data-menu-close]');
const overlay = document.querySelector('[data-overlay]');
const nav = document.querySelector('[data-nav]');

if (menuButton && nav) {
  const openMenu = () => {
    nav.classList.add('is-open');
    document.body.classList.add('nav-open');
    if (overlay) {
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('is-visible'));
    }
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', '메뉴 닫기');
  };

  const closeMenu = () => {
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    if (overlay) {
      overlay.classList.remove('is-visible');
      const hide = () => {
        overlay.hidden = true;
        overlay.removeEventListener('transitionend', hide);
      };
      overlay.addEventListener('transitionend', hide);
    }
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '메뉴 열기');
  };

  menuButton.addEventListener('click', () => {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });
}

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // 형제 요소는 살짝 시차를 두어 순차 등장
          const delay = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.transitionDelay = Math.min(delay, 5) * 60 + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* ---------- Consultation form (Netlify Forms + AJAX) ---------- */
const consultForm = document.querySelector('[data-consult]');
if (consultForm) {
  const status = consultForm.querySelector('[data-form-status]');
  const submitBtn = consultForm.querySelector('button[type="submit"]');
  const encode = (data) =>
    Object.keys(data)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
      .join('&');

  consultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // honeypot: 봇이 채우면 조용히 무시
    if (consultForm.querySelector('[name="bot-field"]').value) return;

    const data = {};
    new FormData(consultForm).forEach((v, k) => { data[k] = v; });

    if (submitBtn) { submitBtn.disabled = true; }
    if (status) { status.className = 'form-status'; status.textContent = '보내는 중…'; }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error('bad status ' + res.status);
        if (status) { status.className = 'form-status ok'; status.textContent = '✓ 상담 신청이 접수되었습니다. 확인 후 빠르게 연락드릴게요!'; }
        consultForm.reset();
      })
      .catch(() => {
        if (status) {
          status.className = 'form-status err';
          status.textContent = '전송에 실패했습니다. 전화(02-425-3278)나 카카오톡으로 문의해 주세요.';
        }
      })
      .finally(() => { if (submitBtn) submitBtn.disabled = false; });
  });
}

/* ---------- 미설정 링크(인스타/카톡 플레이스홀더) 클릭 가드 ---------- */
document.querySelectorAll('a[href="INSTAGRAM_URL"], a[href="KAKAO_URL"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    alert('링크가 아직 설정되지 않았어요. 인스타그램 주소 / 카카오톡 채널 주소를 넣어주시면 연결됩니다.');
  });
});

/* ---------- Stat count-up ---------- */
const counters = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && counters.length) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const dur = 900;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toString();
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toString();
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => cio.observe(el));
}
