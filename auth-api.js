/* ═══════════════════════════════════════════════════════
   PORSCHE — Auth + Booking API client
   Handles: auth state UI, account dropdown, booking modal
═══════════════════════════════════════════════════════ */
'use strict';

const API_BASE = '';   // same origin — served by Express

/* ── Helpers ─────────────────────────────────────────── */
const getToken = () => localStorage.getItem('porsche_token');
const getUser  = () => JSON.parse(localStorage.getItem('porsche_user') || 'null');

async function apiFetch(endpoint, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + endpoint, { ...opts, headers });
  return res.json();
}

/* ══════════════════════════════════
   AUTH STATE — update nav UI
══════════════════════════════════ */
(function initAuthUI() {
  const user  = getUser();
  const token = getToken();

  const navLogin     = document.getElementById('nav-login');
  const navAccount   = document.getElementById('nav-account');
  const mobLogin     = document.getElementById('mob-login');
  const mobAccount   = document.getElementById('mob-account');
  const adminLink    = document.getElementById('acct-admin-link');
  const nameDisplay  = document.getElementById('acct-name-display');

  if (token && user) {
    if (navLogin)    navLogin.style.display   = 'none';
    if (navAccount)  navAccount.style.display = 'inline-flex';
    if (navAccount)  navAccount.textContent   = `${user.name.split(' ')[0]} ▾`;
    if (mobLogin)    mobLogin.style.display   = 'none';
    if (mobAccount)  mobAccount.style.display = 'list-item';
    if (nameDisplay) nameDisplay.textContent  = user.name;
    if (adminLink && user.role === 'admin') adminLink.style.display = 'block';
  } else {
    if (navLogin)   navLogin.style.display   = 'inline-flex';
    if (navAccount) navAccount.style.display = 'none';
    if (mobLogin)   mobLogin.style.display   = 'list-item';
    if (mobAccount) mobAccount.style.display = 'none';
  }
})();

/* ══════════════════════════════════
   ACCOUNT DROPDOWN
══════════════════════════════════ */
let dropdownOpen = false;

window.openAccountMenu = function () {
  const dropdown = document.getElementById('account-dropdown');
  if (!dropdown) return;
  dropdownOpen = !dropdownOpen;
  dropdown.style.display = dropdownOpen ? 'block' : 'none';
};

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('account-dropdown');
  const btn      = document.getElementById('nav-account');
  if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
    dropdownOpen = false;
  }
});

/* ══════════════════════════════════
   LOGOUT
══════════════════════════════════ */
window.logoutUser = function () {
  localStorage.removeItem('porsche_token');
  localStorage.removeItem('porsche_user');
  window.location.href = '/';
};

/* ══════════════════════════════════
   BOOKING MODAL
══════════════════════════════════ */
window.openBookingModal = function () {
  const backdrop = document.getElementById('modal-backdrop');
  const modal    = document.getElementById('booking-modal');
  const form     = document.getElementById('booking-form');
  const prompt   = document.getElementById('modal-login-prompt');

  if (!modal) return;
  document.body.style.overflow = 'hidden';

  const user  = getUser();
  const token = getToken();

  if (token && user) {
    form.style.display   = 'flex';
    prompt.style.display = 'none';
  } else {
    form.style.display   = 'none';
    prompt.style.display = 'block';
  }

  backdrop.classList.add('open');
  modal.classList.add('open');

  // Set min date to tomorrow
  const dateInput = document.getElementById('bk-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }
};

window.closeBookingModal = function () {
  const backdrop = document.getElementById('modal-backdrop');
  const modal    = document.getElementById('booking-modal');
  if (!modal) return;
  backdrop.classList.remove('open');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  clearModalAlert();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeBookingModal();
});

/* ── Modal alert helpers ── */
function showModalAlert(msg, type = 'error') {
  const el = document.getElementById('modal-alert');
  if (!el) return;
  el.textContent  = msg;
  el.className    = `modal-alert ${type}`;
}
function clearModalAlert() {
  const el = document.getElementById('modal-alert');
  if (el) el.className = 'modal-alert';
}

/* ── Booking form submit ── */
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearModalAlert();

    const model         = document.getElementById('bk-model').value;
    const preferredDate = document.getElementById('bk-date').value;
    const phone         = document.getElementById('bk-phone').value.trim();
    const message       = document.getElementById('bk-message').value.trim();

    if (!model)         { showModalAlert('Please select a car model.');        return; }
    if (!preferredDate) { showModalAlert('Please choose a preferred date.');   return; }
    if (!phone)         { showModalAlert('Please enter your phone number.');   return; }

    const btn      = document.getElementById('btn-submit-booking');
    const btnText  = btn.querySelector('.btn-booking-text');
    const spinner  = btn.querySelector('.btn-booking-spinner');

    btnText.style.display = 'none';
    spinner.style.display = 'inline';
    btn.disabled          = true;

    try {
      const data = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ model, preferredDate, phone, message }),
      });

      if (data.success) {
        showModalAlert('🏎 Booking confirmed! We\'ll be in touch within 24 hours.', 'success');
        bookingForm.reset();
        setTimeout(() => window.closeBookingModal(), 3000);
      } else {
        const errMsg = data.errors
          ? data.errors[0].msg
          : (data.message || 'Failed to submit booking.');
        showModalAlert(errMsg);
      }
    } catch (err) {
      showModalAlert('Network error — is the server running?');
    } finally {
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      btn.disabled          = false;
    }
  });
}

/* ══════════════════════════════════
   MY BOOKINGS — simple modal view
══════════════════════════════════ */
window.viewMyBookings = function () {
  const dropdown = document.getElementById('account-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  dropdownOpen = false;
  fetchAndShowMyBookings();
};

async function fetchAndShowMyBookings() {
  const data = await apiFetch('/api/bookings/mine');
  if (!data.success) { alert('Failed to load bookings.'); return; }

  if (!data.bookings.length) {
    alert('You have no test drive bookings yet.\n\nUse "Book a Test Drive" to schedule one!');
    return;
  }

  // Supabase returns snake_case — handle both preferred_date and preferredDate
  const items = data.bookings.map(b => {
    const dateVal = b.preferred_date || b.preferredDate;
    const dt = new Date(dateVal).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    return `• ${b.model} — ${dt} [${b.status.toUpperCase()}]`;
  }).join('\n');

  alert(`Your Test Drive Bookings:\n\n${items}`);
}

/* ══════════════════════════════════
   Hero & model "Book Test Drive" btns
══════════════════════════════════ */
(function wireUpBookingTriggers() {
  // We keep this function for any other booking-specific triggers if needed
  // but hero-configure and btn-configurator are now handled by the configurator logic in script.js
})();

/* ══════════════════════════════════
   CAR ORDERS API
══════════════════════════════════ */
window.placeOrder = async function() {
  const user = getUser();
  const token = getToken();

  if (!token || !user) {
    alert('Please sign in to place an order.');
    window.location.href = '/login';
    return;
  }

  const btn = document.getElementById('btn-place-order');
  const originalText = btn.textContent;
  btn.textContent = 'Processing...';
  btn.disabled = true;

  try {
    // window.configState is defined in script.js
    const data = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        model: window.configState.model,
        exteriorColor: window.configState.exteriorColor,
        interiorColor: window.configState.interiorColor,
        wheels: window.configState.wheels,
        totalPrice: window.configState.totalPrice
      })
    });

    if (data.success) {
      alert('🏎 Congratulations! Your Porsche order has been placed successfully.\n\nOur concierge will contact you shortly to finalize the details.');
      window.closeConfigurator();
    } else {
      alert(data.message || 'Failed to place order.');
    }
  } catch (err) {
    alert('Network error. Please try again.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
};

window.viewMyOrders = function() {
  const dropdown = document.getElementById('account-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  if (window.dropdownOpen !== undefined) window.dropdownOpen = false;
  fetchAndShowMyOrders();
};

async function fetchAndShowMyOrders() {
  const data = await apiFetch('/api/orders/mine');
  if (!data.success) { alert('Failed to load orders.'); return; }

  if (!data.orders.length) {
    alert('You have no car orders yet.\n\nUse the Configurator to build your dream Porsche!');
    return;
  }

  const items = data.orders.map(o => {
    const dt = new Date(o.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    return `• ${o.model} (${o.exterior_color}) — € ${o.total_price.toLocaleString()} [${o.status.toUpperCase()}]`;
  }).join('\n');

  alert(`Your Porsche Orders:\n\n${items}`);
}
