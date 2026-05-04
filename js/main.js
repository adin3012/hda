/* ============================================================
   main.js — Himanshu Deka Academy (HDA)
   Functionalities mirrored from GFWA + HDA enhancements
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Mobile Menu ----------
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu() {
  if (!mobileMenu || !hamburger) return;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', false);
  hamburger.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
    const isOpen = mobileMenu.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

// ---------- Scroll Fade-In (.fade-in elements) ----------
const fadeEls = document.querySelectorAll('.fade-in');

if (!prefersReducedMotion) {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  const vph = window.innerHeight;
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < vph) {
      // Already in viewport on load — show immediately, no animation
      el.style.opacity = '1';
      el.style.transform = 'none';
    } else {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      fadeObserver.observe(el);
    }
  });
} else {
  fadeEls.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
}

const fadeStyle = document.createElement('style');
fadeStyle.textContent = `.fade-in.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(fadeStyle);

// ---------- Scroll Animate Cards ----------
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

const cardTargets = document.querySelectorAll(
  '.pain-item, .included-card, .why-card, .prog-card, ' +
  '.testimonial-card, .transform-item, .solution-point, ' +
  '.contact-option-card, .faq-item'
);

if (!prefersReducedMotion) {
  cardTargets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
    cardObserver.observe(el);
  });
}

// ---------- Active Nav Link ----------
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.split('#')[0] === currentPage) {
    link.classList.add('active');
  }
});

// ---------- Smooth Scroll ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });
});

// ---------- Navbar Scroll Effect ----------
const nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.pageYOffset > 50);
    nav.style.boxShadow = window.scrollY > 40 ? '0 4px 24px rgba(0,0,0,0.4)' : 'none';
  }, { passive: true });
}

// ---------- Testimonials Touch Pause ----------
const testimonialsScroll = document.querySelector('.testimonials-scroll');
if (testimonialsScroll) {
  let isTouching = false;
  testimonialsScroll.addEventListener('touchstart', () => {
    isTouching = true;
    testimonialsScroll.style.animationPlayState = 'paused';
  }, { passive: true });
  testimonialsScroll.addEventListener('touchend', () => {
    isTouching = false;
    setTimeout(() => { if (!isTouching) testimonialsScroll.style.animationPlayState = 'running'; }, 1000);
  }, { passive: true });
}

// ---------- Dot Pulse ----------
document.querySelectorAll('.dot').forEach(dot => {
  dot.style.animation = 'pulse 2s infinite';
});

// ---------- Scroll Progress Bar ----------
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = Math.min(pct, 100) + '%';
}, { passive: true });

// ---------- Back to Top ----------
const btt = document.createElement('button');
btt.className = 'back-to-top';
btt.setAttribute('aria-label', 'Back to top');
btt.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`;
document.body.appendChild(btt);
window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

// ---------- Toast ----------
function showToast(msg, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = type === 'success'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icon} ${msg}`;
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4500);
}

// ---------- Number Counter ----------
function animateCounter(el) {
  const target   = parseInt(el.dataset.count);
  const start    = el.dataset.start !== undefined ? parseInt(el.dataset.start) : 0;
  const suffix   = el.dataset.suffix || '';
  const duration = 1600;
  const countDown = start > target;
  const range    = Math.abs(target - start);
  const step     = range / (duration / 16);
  let current    = start;

  el.textContent = start + suffix;

  const timer = setInterval(() => {
    if (countDown) {
      current = Math.max(current - step, target);
      el.textContent = Math.ceil(current) + suffix;
      if (current <= target) { el.textContent = target + suffix; clearInterval(timer); }
    } else {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) { el.textContent = target + suffix; clearInterval(timer); }
    }
  }, 16);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stat-counter').forEach(el => statObserver.observe(el));

// ---------- FAQ Accordion ----------
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ---------- Tab System ----------
document.querySelectorAll('[data-tabs]').forEach(container => {
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
    });
  });
});

// ---------- Transformation Carousel Drag ----------
(function () {
  const track = document.getElementById('tfTrack');
  if (!track) return;
  let isDragging = false, startX = 0, scrollStart = 0, moved = false;

  track.addEventListener('mousedown', e => {
    isDragging = true; moved = false;
    startX = e.pageX;
    scrollStart = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
    track.style.cursor = 'grab';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = scrollStart - dx;
  });
  // Prevent click-through after drag
  track.addEventListener('click', e => {
    if (moved) { e.preventDefault(); e.stopPropagation(); }
  });
})();

// ---------- Lightbox ----------
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button class="lightbox-close" aria-label="Close">✕</button>
  <img class="lightbox-img" src="" alt="Transformation" />
`;
document.body.appendChild(lightbox);

function openLightbox(src) {
  lightbox.querySelector('.lightbox-img').src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.transform-item[data-src]').forEach(item => {
  item.addEventListener('click', () => openLightbox(item.dataset.src));
});
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

// ---------- Video Play ----------
function toggleVideo() {
  const video = document.getElementById('journeyVideo');
  if (!video) return;
  const btn = video.nextElementSibling;
  if (video.paused) {
    video.play();
    if (btn) btn.classList.add('hidden');
  } else {
    video.pause();
    if (btn) btn.classList.remove('hidden');
  }
}

// ---------- Google Sheets Lead Capture ----------
// HOW TO SET UP:
// 1. Go to forms.google.com and create a form with fields: Name, Email, WhatsApp, Interest, Source
// 2. Get the form action URL from the form's pre-filled link
// 3. Get entry IDs by inspecting the form network request
// 4. Set LEADS_ENABLED = true and fill in your values below

const LEADS_ENABLED = false; // set to true once configured
const GOOGLE_FORM_ACTION = 'YOUR_GOOGLE_FORM_ACTION_URL';
const LEAD_FIELDS = {
  name:      'entry.XXXXXXXXX',
  email:     'entry.XXXXXXXXX',
  whatsapp:  'entry.XXXXXXXXX',
  interest:  'entry.XXXXXXXXX',
  source:    'entry.XXXXXXXXX',
};

function submitLeadToSheets(data) {
  if (!LEADS_ENABLED) return;
  const body = new URLSearchParams();
  if (data.name)     body.append(LEAD_FIELDS.name,     data.name);
  if (data.email)    body.append(LEAD_FIELDS.email,    data.email);
  if (data.whatsapp) body.append(LEAD_FIELDS.whatsapp, data.whatsapp);
  if (data.interest) body.append(LEAD_FIELDS.interest, data.interest);
  if (data.source)   body.append(LEAD_FIELDS.source,   data.source);
  fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body });
}

// ---------- Entry Lead Popup ----------
(function injectLeadPopup() {
  if (localStorage.getItem('hda_lead_captured')) return;
  if (document.getElementById('leadPopup')) return;

  const html = `
  <div class="apply-modal" id="leadPopup">
    <div class="apply-modal-content" style="max-width:460px;">
      <button class="apply-modal-close" onclick="closeLeadPopup(true)" aria-label="Close">✕</button>
      <div id="leadPopupForm">
        <p style="font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--text2);margin-bottom:12px;">Free Consultation</p>
        <h2 style="font-size:1.5rem;margin-bottom:8px;">Before you explore —</h2>
        <p class="modal-sub">Drop your details and Himanshu will personally reach out to answer any questions.</p>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:4px;">
          <input type="text"  id="lpName"     placeholder="Your name *"                style="padding:13px 16px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:0.95rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
          <input type="email" id="lpEmail"    placeholder="Email address *"             style="padding:13px 16px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:0.95rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
          <input type="tel"   id="lpWhatsApp" placeholder="WhatsApp number (optional)"  style="padding:13px 16px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:0.95rem;outline:none;font-family:inherit;width:100%;box-sizing:border-box;" />
          <button id="lpSubmitBtn" onclick="handleLeadPopupSubmit()" class="btn btn-primary" style="justify-content:center;margin-top:4px;">Get in Touch</button>
          <button onclick="closeLeadPopup(true)" style="background:none;border:none;color:var(--muted);font-size:0.82rem;cursor:pointer;font-family:inherit;padding:4px;">No thanks, I'll just browse</button>
        </div>
      </div>
      <div id="leadPopupSuccess" style="display:none;text-align:center;padding:32px 0;">
        <div style="font-size:2rem;margin-bottom:12px;">👋</div>
        <h3 style="margin-bottom:8px;">Got it — Himanshu will reach out soon.</h3>
        <p style="color:var(--muted);font-size:0.9rem;">Feel free to explore the site in the meantime.</p>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('leadPopup').addEventListener('click', e => {
    if (e.target === document.getElementById('leadPopup')) closeLeadPopup(true);
  });

  // Show after 5 seconds
  setTimeout(() => {
    const popup = document.getElementById('leadPopup');
    if (popup && !localStorage.getItem('hda_lead_captured')) {
      popup.style.display = 'flex';
      requestAnimationFrame(() => { popup.style.opacity = '1'; });
    }
  }, 5000);
})();

function handleLeadPopupSubmit() {
  const name     = (document.getElementById('lpName')?.value || '').trim();
  const email    = (document.getElementById('lpEmail')?.value || '').trim();
  const whatsapp = (document.getElementById('lpWhatsApp')?.value || '').trim();

  if (!name)  { document.getElementById('lpName').focus(); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('lpEmail').focus(); return; }

  const btn = document.getElementById('lpSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

  submitLeadToSheets({ name, email, whatsapp, source: 'entry-popup' });
  localStorage.setItem('hda_lead_captured', '1');

  document.getElementById('leadPopupForm').style.display    = 'none';
  document.getElementById('leadPopupSuccess').style.display = 'block';

  setTimeout(() => closeLeadPopup(false), 2500);
}

function closeLeadPopup(skipFlag) {
  const popup = document.getElementById('leadPopup');
  if (!popup) return;
  if (skipFlag) localStorage.setItem('hda_lead_captured', 'skipped');
  popup.style.opacity = '0';
  setTimeout(() => { popup.style.display = 'none'; document.body.style.overflow = ''; }, 300);
}

// ---------- Pricing ----------
// TODO: Update with Himanshu's actual pricing per plan
const PRICING = {
  IN: { symbol: '₹', monthly: '8,000',  quarterly: '21,000', halfYearly: '38,000', annual: '72,000', flag: '🇮🇳 India' },
  US: { symbol: '$', monthly: '120',    quarterly: '300',    halfYearly: '540',    annual: '1,020',  flag: '🇺🇸 USA' },
  AU: { symbol: 'A$',monthly: '140',    quarterly: '350',    halfYearly: '630',    annual: '1,190',  flag: '🇦🇺 Australia' },
  AE: { symbol: 'AED',monthly: '480',   quarterly: '1,200',  halfYearly: '2,160',  annual: '4,080',  flag: '🇦🇪 UAE' },
};

function updateModalPricing() {
  const select = document.getElementById('modalCountry');
  if (!select) return;
  const p = PRICING[select.value] || PRICING.IN;
  const interest = document.getElementById('interest');
  if (!interest) return;
  const current = interest.value;
  interest.innerHTML = `
    <option value="">Select a programme</option>
    <option value="monthly">Monthly — ${p.symbol}${p.monthly}</option>
    <option value="quarterly">Quarterly — ${p.symbol}${p.quarterly}</option>
    <option value="half-yearly">Half Yearly — ${p.symbol}${p.halfYearly}</option>
    <option value="annual">Annual — ${p.symbol}${p.annual}</option>
    <option value="just-curious">Not sure yet, just exploring</option>
  `;
  interest.value = current;
}

// ---------- Apply Modal ----------
(function injectApplyModal() {
  if (document.getElementById('applyModal')) return;
  const html = `
  <div class="apply-modal" id="applyModal">
    <div class="apply-modal-content">
      <button class="apply-modal-close" onclick="closeApplyModal()" aria-label="Close">✕</button>

      <!-- Step 1: Choose contact method -->
      <div id="applyStep1">
        <h2>How would you like to apply?</h2>
        <p class="modal-sub">Choose your preferred way to get in touch.</p>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:28px;">
          <button class="btn-modal-wa" onclick="applyViaWhatsApp()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Message on WhatsApp
          </button>
          <a class="btn-modal-call-primary" href="tel:+918486791489" onclick="closeApplyModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call +91 84867 91489
          </a>
          <button class="btn-modal-form" onclick="showApplyForm()" style="justify-content:center;">
            Fill Out the Form
          </button>
        </div>
      </div>

      <!-- Step 2: Full application form -->
      <div id="applyStep2" style="display:none;">
        <h2>Apply for Coaching</h2>
        <p class="modal-sub">Fill in your details and Himanshu will get back to you within 24 hours.</p>
        <div id="hdaContactForm">
          <div class="form-group">
            <label for="modalCountry">Your Country</label>
            <select id="modalCountry" onchange="updateModalPricing()">
              <option value="IN">🇮🇳 India</option>
              <option value="US">🇺🇸 USA</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="AE">🇦🇪 UAE</option>
            </select>
          </div>
          <div class="form-group">
            <label for="hdaName">Your Name</label>
            <input type="text" id="hdaName" placeholder="e.g. Rahul Sharma" required maxlength="80" autocomplete="name" />
          </div>
          <div class="form-group">
            <label for="hdaEmail">Email Address</label>
            <input type="email" id="hdaEmail" placeholder="rahul@example.com" required maxlength="120" autocomplete="email" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="hdaWeight">Current Weight (kg)</label>
              <input type="number" id="hdaWeight" placeholder="e.g. 85" min="30" max="300" required />
            </div>
            <div class="form-group">
              <label for="hdaHeight">Height (cm)</label>
              <input type="number" id="hdaHeight" placeholder="e.g. 175" min="100" max="250" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="hdaAge">Age</label>
              <input type="number" id="hdaAge" placeholder="e.g. 28" min="16" max="80" required />
            </div>
            <div class="form-group">
              <label for="hdaActivity">Activity Level</label>
              <select id="hdaActivity" required>
                <option value="">Select level</option>
                <option value="sedentary">Sedentary (desk job, no exercise)</option>
                <option value="light">Lightly Active (1–2 days/week)</option>
                <option value="moderate">Moderately Active (3–4 days/week)</option>
                <option value="active">Very Active (5+ days/week)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="interest">Programme of Interest</label>
            <select id="interest" required>
              <option value="">Select a programme</option>
              <option value="monthly">Monthly — ₹8,000</option>
              <option value="quarterly">Quarterly — ₹21,000</option>
              <option value="half-yearly">Half Yearly — ₹38,000</option>
              <option value="annual">Annual — ₹72,000</option>
              <option value="just-curious">Not sure yet, just exploring</option>
            </select>
          </div>
          <div class="form-group">
            <label for="hdaGoal">Your Goal</label>
            <textarea id="hdaGoal" placeholder="What is your primary goal? Fat loss, body recomposition, performance improvement?" maxlength="1000" required></textarea>
          </div>
          <button type="button" class="btn btn-primary" id="hdaSubmitBtn" style="width:100%;justify-content:center;" onclick="handleFormSubmit()">
            Send My Details
          </button>
        </div>
        <div id="hdaFormSuccess" style="display:none;text-align:center;padding:40px 0;">
          <h3 style="margin-bottom:12px;">Message sent.</h3>
          <p style="color:var(--muted);font-size:0.9rem;">Himanshu will get back to you within 24 hours.</p>
        </div>
      </div>

    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('applyModal').addEventListener('click', e => {
    if (e.target === document.getElementById('applyModal')) closeApplyModal();
  });
})();

function openApplyModal() {
  const modal = document.getElementById('applyModal');
  if (!modal) return;
  document.getElementById('applyStep1').style.display = 'block';
  document.getElementById('applyStep2').style.display = 'none';
  const form    = document.getElementById('hdaContactForm');
  const success = document.getElementById('hdaFormSuccess');
  if (form)    form.style.display    = 'block';
  if (success) success.style.display = 'none';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

const MENTORSHIP_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeao9f6eGiqDS6OwgkTtbCB07rtGkImzAUUF4nOaIsGRRRQXA/viewform';
const COACHING_COURSE_FORM_URL = 'https://forms.gle/Mm8xgfYLXVKzCqzS7';

function openFormDirect() {
  const url = window.location.pathname.includes('mentorship') ? MENTORSHIP_FORM_URL : COACHING_COURSE_FORM_URL;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function showApplyForm() {
  const path = window.location.pathname;
  if (path.includes('mentorship')) {
    closeApplyModal();
    window.open(MENTORSHIP_FORM_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  if (path.includes('coaching') || path.includes('course') || path === '/' || path.endsWith('index.html')) {
    closeApplyModal();
    window.open(COACHING_COURSE_FORM_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  document.getElementById('applyStep1').style.display = 'none';
  document.getElementById('applyStep2').style.display = 'block';
  updateModalPricing();
}

function applyViaWhatsApp() {
  closeApplyModal();
  window.open('https://wa.me/918486791489?text=Hi%20Himanshu%2C%20I%20want%20to%20apply%20for%20HDA%20Coaching.', '_blank', 'noopener');
}

function closeApplyModal() {
  const modal = document.getElementById('applyModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  document.querySelector('.nav-cta')?.focus();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('applyModal');
    if (modal?.classList.contains('active')) {
      e.preventDefault();
      closeApplyModal();
    }
  }
});

// ---------- Sanitize ----------
function sanitize(str, maxLen) {
  if (!str) return '';
  return str.replace(/[<>"'`]/g, '').slice(0, maxLen).trim();
}

// ---------- Form Submit ----------
function handleFormSubmit() {
  const name     = sanitize(document.getElementById('hdaName')?.value, 80);
  const email    = sanitize(document.getElementById('hdaEmail')?.value, 120);
  const weight   = sanitize(document.getElementById('hdaWeight')?.value, 5);
  const height   = sanitize(document.getElementById('hdaHeight')?.value, 5);
  const age      = sanitize(document.getElementById('hdaAge')?.value, 3);
  const activity = document.getElementById('hdaActivity')?.value || '';
  const interest = document.getElementById('interest')?.value || '';
  const goal     = sanitize(document.getElementById('hdaGoal')?.value, 1000);

  if (!name || !email || !weight || !height || !age || !activity || !interest || !goal) {
    showToast('Please fill in all fields before submitting.', 'error');
    return;
  }

  if (+weight < 30 || +weight > 300) { showToast('Please enter a valid weight (30–300 kg).', 'error'); return; }
  if (+height < 100 || +height > 250) { showToast('Please enter a valid height (100–250 cm).', 'error'); return; }
  if (+age < 16 || +age > 80) { showToast('Please enter a valid age (16–80).', 'error'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email address.', 'error'); return; }

  const validActivity = ['sedentary','light','moderate','active'];
  const validInterest = ['monthly','quarterly','half-yearly','annual','just-curious'];
  if (!validActivity.includes(activity) || !validInterest.includes(interest)) {
    showToast('Please select your activity level and programme of interest.', 'error');
    return;
  }

  const btn = document.getElementById('hdaSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

  submitLeadToSheets({ name, email, interest, source: 'apply-modal' });

  // Show success immediately — fire-and-forget to backend when endpoint is configured
  const form    = document.getElementById('hdaContactForm');
  const success = document.getElementById('hdaFormSuccess');
  if (form)    form.style.display    = 'none';
  if (success) success.style.display = 'block';

  const CONTACT_ENDPOINT = '';  // TODO: set to your API endpoint e.g. 'https://yoursite.com/api/contact'
  if (CONTACT_ENDPOINT) {
    fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, weight, height, age, activity, interest, message: goal })
    }).catch(() => {}); // silent — success already shown
  }
}

// ---------- Dynamic Pricing (standalone page) ----------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('countrySelect')) updatePricing();
});

function updatePricing() {
  const select = document.getElementById('countrySelect');
  if (!select) return;
  const selectedOption = select.options[select.selectedIndex];
  const symbol = selectedOption.dataset.symbol;
  document.querySelectorAll('.pricing-card .price[data-plan]').forEach(priceEl => {
    const plan  = priceEl.dataset.plan;
    const price = selectedOption.dataset[plan];
    priceEl.textContent = symbol === '₹'
      ? `${symbol}${parseInt(price).toLocaleString('en-IN')}`
      : `${symbol}${parseInt(price).toLocaleString()}`;
  });
}

// ---------- EmailJS Form Handling ----------
// Setup: sign up at emailjs.com, create a service + template, fill in credentials below.
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

function handleForm(formEl) {
  if (!formEl) return;
  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    if (typeof emailjs === 'undefined') {
      showToast('Email service not configured yet. Please message on WhatsApp.', 'error');
      return;
    }
    const btn      = formEl.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.disabled   = true;
    btn.textContent = 'Sending…';
    const data = Object.fromEntries(new FormData(formEl));
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);
      showToast('Message sent! Himanshu will reach out within 24 hours.', 'success');
      formEl.reset();
    } catch {
      showToast('Something went wrong. Please try WhatsApp instead.', 'error');
    } finally {
      btn.disabled    = false;
      btn.textContent = original;
    }
  });
}

handleForm(document.getElementById('applyForm'));
handleForm(document.getElementById('enquiryForm'));

// ---------- Story Slider ----------
(function initStorySlider() {
  const wrap   = document.querySelector('.slider-track-wrap');
  const track  = document.querySelector('.slider-track');
  const dotsEl = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.slider-btn--prev');
  const nextBtn = document.querySelector('.slider-btn--next');
  if (!track || !wrap) return;

  const slides = track.querySelectorAll('.slider-slide');
  const total  = slides.length;
  let current  = 0;
  let startX   = 0;
  let isDragging = false;
  let dragDelta  = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function updateUI() {
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    updateUI();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / mouse drag
  function onDragStart(x) { startX = x; isDragging = true; dragDelta = 0; track.style.transition = 'none'; }
  function onDragMove(x)  { if (!isDragging) return; dragDelta = x - startX; track.style.transform = `translateX(calc(-${current * 100}% + ${dragDelta}px))`; }
  function onDragEnd()    {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const threshold = wrap.offsetWidth * 0.2;
    if (dragDelta < -threshold) goTo(current + 1);
    else if (dragDelta > threshold) goTo(current - 1);
    else updateUI();
  }

  // Touch
  wrap.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
  wrap.addEventListener('touchmove',  e => onDragMove(e.touches[0].clientX),  { passive: true });
  wrap.addEventListener('touchend',   onDragEnd);

  // Mouse drag
  wrap.addEventListener('mousedown',  e => onDragStart(e.clientX));
  wrap.addEventListener('mousemove',  e => onDragMove(e.clientX));
  wrap.addEventListener('mouseup',    onDragEnd);
  wrap.addEventListener('mouseleave', onDragEnd);

  // Keyboard when focused
  wrap.setAttribute('tabindex', '0');
  wrap.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  updateUI();
})();

// ---------- Escape Key Handler ----------
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeApplyModal();
    closeTransformModal();
    if (lightbox.classList.contains('open')) closeLightbox();
  }
});

// ---------- Transformation Modal ----------
function openTransformModal() {
  const modal = document.getElementById('transformModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeTransformModal() {
  const modal = document.getElementById('transformModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ---------- Testimonials Carousel ----------
(function () {
  const TESTI_DATA = [
    { type: 'text', avatar: 'K', name: 'Kankan Kalita', role: '@kankan_kalita_coach', text: "Himanshu's approach was different from anything I'd tried before. It was a difficult transformation but he pushed me through every step. Incredibly grateful." },
    { type: 'video', ytId: 'HDKWAIgmtxc', label: 'HDA Story' },
    { type: 'text', avatar: 'B', name: 'Biswaraj Das', role: '@biswaraj_das', text: "It was an absolute pleasure working with Himanshu. The planning was precise and the execution even better. Couldn't have done this without HDA." },
    { type: 'text', avatar: 'M', name: 'Mayur Kalita', role: '@mayurkalita94', text: "One of the best decisions I made. Himanshu kept me disciplined and focused. The results speak for themselves — so happy with this transformation." },
    { type: 'text', avatar: 'A', name: 'Abhijnan Gogoi', role: '@abhijnan_gogoi_100', text: "Very dedicated program. Himanshu's execution planning is on another level. As an aspiring fitness professional, this mentorship shaped my entire approach." },
    { type: 'text', avatar: 'N', name: 'Nekib', role: '@oye_its_nkb', text: "Stop imagining and start taking action — that's what Himanshu drilled into me. One of the most dedicated coaches I've worked with. Worth every rupee." },
    { type: 'text', avatar: 'P', name: 'Piyush Goswami', role: '@fit_with_pg', text: "Himanshu said I was one of the most hardworking men in the room — and that kept me going. The results I achieved with HDA exceeded everything I expected." },
    { type: 'text', avatar: 'A', name: 'Adin Ankur Saikia', role: 'HDA Client', text: "HDA completely shifted how I approach fitness. The structure, the accountability, the knowledge — everything was top tier. Highly recommend to anyone serious about results." },
  ];

  const track   = document.getElementById('testiTrack');
  const dotsEl  = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  if (!track) return;

  const TOTAL = TESTI_DATA.length;
  let current = 0;
  let autoTimer;

  function getPerView() { return window.innerWidth < 768 ? 1 : 3; }

  TESTI_DATA.forEach(t => {
    const card = document.createElement('div');
    card.className = 'testi-card';
    if (t.type === 'video') {
      card.innerHTML = `<div class="testi-card-yt">
        <img src="https://img.youtube.com/vi/${t.ytId}/maxresdefault.jpg" alt="${t.label}" loading="lazy" />
        <div class="testi-card-play"><svg width="38" height="38" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></div>
        <span class="testi-card-yt-label">${t.label}</span>
      </div>`;
      card.addEventListener('click', () => openTestiYT(t.ytId));
    } else {
      const preview = t.text.length > 110 ? t.text.slice(0, 110) + '...' : t.text;
      card.innerHTML = `<div class="testi-card-inner">
        <div class="testi-card-quote">"</div>
        <p class="testi-card-text">${preview}</p>
        <div class="testi-card-author">
          <div class="testi-card-avatar">${t.avatar}</div>
          <div>
            <div class="testi-card-name">${t.name}</div>
            <div class="testi-card-role">${t.role}</div>
          </div>
        </div>
        <div class="testi-card-tap">Tap to read full review</div>
      </div>`;
      card.addEventListener('click', () => openTestiPopup(t));
    }
    track.appendChild(card);
  });

  for (let i = 0; i < TOTAL; i++) {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  }

  function updateUI() {
    const pv = getPerView();
    const pct = 100 / pv;
    track.querySelectorAll('.testi-card').forEach(c => { c.style.minWidth = pct + '%'; });
    track.style.transform = `translateX(-${current * pct}%)`;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= TOTAL - pv;
  }

  function goTo(idx) {
    const pv = getPerView();
    current = Math.max(0, Math.min(idx, TOTAL - pv));
    updateUI();
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      const pv = getPerView();
      current = current >= TOTAL - pv ? 0 : current + 1;
      updateUI();
    }, 4000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  const wrap = document.getElementById('testiCarouselWrap');
  if (wrap) {
    let tx0 = 0;
    wrap.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx0;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    });
  }

  window.addEventListener('resize', updateUI, { passive: true });
  updateUI();
  resetAuto();
})();

function openTestiYT(ytId) {
  const modal  = document.getElementById('testiYTModal');
  const iframe = document.getElementById('testiYTIframe');
  if (!modal || !iframe) return;
  iframe.src = 'https://www.youtube.com/embed/' + (ytId || 'HDKWAIgmtxc') + '?autoplay=1&rel=0';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTestiYT() {
  const modal  = document.getElementById('testiYTModal');
  const iframe = document.getElementById('testiYTIframe');
  if (modal)  modal.classList.remove('active');
  if (iframe) iframe.src = '';
  document.body.style.overflow = '';
}

function openTestiPopup(t) {
  const modal = document.getElementById('testiPopupModal');
  if (!modal) return;
  document.getElementById('popupAvatar').textContent = t.avatar;
  document.getElementById('popupName').textContent   = t.name;
  document.getElementById('popupRole').textContent   = t.role;
  document.getElementById('popupText').textContent   = t.text;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTestiPopup() {
  const modal = document.getElementById('testiPopupModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeTestiYT(); closeTestiPopup(); }
});


