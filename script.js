// ── MOBILE CURSOR GUARD ──
// Only run custom cursor on pointer-fine devices (not touch screens)
const isPointerFine = window.matchMedia('(pointer:fine)').matches;

const dot = document.getElementById('curDot');
const ring = document.getElementById('curRing');

if (!isPointerFine) {
  // Hide cursor elements entirely on touch devices
  if (dot) dot.style.display = 'none';
  if (ring) ring.style.display = 'none';
  document.body.style.cursor = 'auto';
} else {
  // ── POKÉBALL CURSOR ──
  document.documentElement.classList.add('custom-cursor');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    document.documentElement.classList.add('cursor-active');
  });
  (function anim() {
    if (dot)  { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(anim);
  })();
  document.querySelectorAll('a,button,.proj-card,.sk,.astat').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}

// ── SCROLL BAR ──
const bar = document.getElementById('scrollBar');
window.addEventListener('scroll', () => {
  if (!bar) return;
  const scrollable = document.body.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  bar.style.width = pct + '%';
});
// ── REVEAL ON SCROLL ──
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── PARALLAX BLOBS (respects reduced-motion) ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.querySelectorAll('.type-blob,.deco-ball').forEach((g, i) => {
      g.style.transform = `translateY(${y * (0.06 + i * 0.02)}px)`;
    });
  });
}

// ── DARK MODE TOGGLE ──
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeIcon) themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (themeIcon) themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta');

function openMenu() {
  hamburger.classList.add('active');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMenu);
if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMenu);
mobileNavLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// ── TYPEWRITER EFFECT ──
const typewriterEl = document.getElementById('typewriter');
const phrases = [
  'Digital Things',
  'Cool Stuff',
  'Web Apps',
  'ML Models',
  'Real Products',
  'Bold Ideas',
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 90;
const deletingSpeed = 50;
const pauseAfterTyping = 2000;
const pauseAfterDeleting = 400;

function typeWriter() {
  if (!typewriterEl) return;
  const current = phrases[phraseIndex];

  if (!isDeleting) {
    typewriterEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeWriter, pauseAfterTyping);
      return;
    }
    setTimeout(typeWriter, typingSpeed);
  } else {
    typewriterEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeWriter, pauseAfterDeleting);
      return;
    }
    setTimeout(typeWriter, deletingSpeed);
  }
}

// Start typewriter after hero animation settles (skip animation for reduced-motion users)
if (prefersReducedMotion) {
  if (typewriterEl) typewriterEl.textContent = phrases[0];
} else {
  setTimeout(typeWriter, 1200);
}

// ── VIEW COUNTER (Supabase-based or local fallback) ──
// NOTE: Replace SUPABASE_URL and SUPABASE_ANON_KEY with your own project keys.
// Free tier at supabase.com — create a table `page_views` with columns: id (int8, PK), page (text), count (int8)
// Then insert a row: { id: 1, page: 'home', count: 0 }
const viewCountEl = document.getElementById('viewCount');
const viewCountStatusEl = document.getElementById('viewCountStatus');

const SUPABASE_URL = ''; // e.g. 'https://xyzxyz.supabase.co'
const SUPABASE_ANON_KEY = ''; // your anon/public key
const PAGE_KEY = 'home';

async function updateLiveViewCount() {
  if (!viewCountEl) return;

  // If Supabase is configured, use it
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      // Increment
      const incRes = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/increment_view_count`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ page_name: PAGE_KEY }),
          cache: 'no-store',
        }
      );
      if (!incRes.ok) throw new Error('Supabase RPC failed');
      const count = await incRes.json();
      viewCountEl.textContent = Number.isFinite(Number(count))
        ? Number(count).toLocaleString('en-IN') : '--';
      if (viewCountStatusEl) viewCountStatusEl.textContent = 'global';
      return;
    } catch (err) {
      console.warn('Supabase view counter failed, using local fallback:', err);
    }
  }

  // Local fallback (works offline / without backend)
  const localKey = 'portfolioLocalViews';
  const localCount = Number(localStorage.getItem(localKey) || '0') + 1;
  localStorage.setItem(localKey, String(localCount));
  viewCountEl.textContent = `${localCount.toLocaleString('en-IN')}*`;
  if (viewCountStatusEl) viewCountStatusEl.textContent = 'local';
}

updateLiveViewCount();

// ── CONTACT FORM with mailto fallback ──
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formSubmitButton = contactForm ? contactForm.querySelector('.form-submit') : null;
const recipientEmail = 'pradhanarush73@gmail.com';

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const name = contactForm.elements.name.value.trim();
    const email = contactForm.elements.email.value.trim();
    const message = contactForm.elements.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill all fields before sending.';
      formStatus.classList.remove('is-success');
      formStatus.classList.add('is-error');
      return;
    }

    formStatus.textContent = 'Sending your message...';
    formStatus.classList.remove('is-success', 'is-error');
    if (formSubmitButton) {
      formSubmitButton.disabled = true;
      formSubmitButton.textContent = 'SENDING...';
    }

    let sent = false;

    // Primary: formsubmit.co
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, email, message,
          _subject: `Portfolio message from ${name}`,
          _replyto: email,
          _captcha: 'false',
          _template: 'table',
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === 'false') throw new Error(result.message || 'Send failed.');

      formStatus.textContent = 'Message sent successfully. ✓';
      formStatus.classList.add('is-success');
      contactForm.reset();
      sent = true;
    } catch (error) {
      console.warn('formsubmit.co failed, trying mailto fallback:', error);
    }

    // Fallback: mailto link
    if (!sent) {
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

      formStatus.innerHTML = `Couldn't auto-send. <a href="${mailtoUrl}" style="color:var(--red);text-decoration:underline;">Click here to send via your email app ↗</a>`;
      formStatus.classList.remove('is-success');
      formStatus.classList.add('is-error');
    }

    if (formSubmitButton) {
      formSubmitButton.disabled = false;
      formSubmitButton.textContent = 'SEND MESSAGE ▶';
    }
  });
}

// ── BACK TO TOP ──
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
