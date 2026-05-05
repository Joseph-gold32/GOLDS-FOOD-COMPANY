// =============================================
// FIREBASE CONFIG — Replace with your own
// =============================================
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxmUP2Z3hXryYrFR8JXlxJs_LpJWoXNBU",
  authDomain: "food-website-8555c.firebaseapp.com",
  projectId: "food-website-8555c",
  storageBucket: "food-website-8555c.firebasestorage.app",
  messagingSenderId: "724030676404",
  appId: "1:724030676404:web:480f724eb5db5514eaa6e1",
  measurementId: "G-SYYX7630GJ"
};

// Initialize Firebase (using compat SDK loaded in HTML)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Optional EmailJS notification settings — replace with your own service/template IDs
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

function notifySignInEmail(email, action) {
  if (!window.emailjs || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) return;
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    user_email: email,
    action,
    website_name: 'Gold Foods'
  }).catch(err => console.error('Email notification failed:', err));
}
// =============================================
// NAVBAR — scroll & mobile
// =============================================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Mark active nav link
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});

// =============================================
// TOAST
// =============================================
function showToast(msg, icon = '✅') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${msg}</span>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

// =============================================
// CART
// =============================================
let cart = JSON.parse(localStorage.getItem('gf_cart') || '[]');

function saveCart() {
  localStorage.setItem('gf_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.querySelector('.badge');
  const count = cart.reduce((s, i) => s + i.qty, 0);
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function addToCart(name, price, image) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx > -1) {
    cart[idx].qty++;
  } else {
    cart.push({ name, price, image, qty: 1 });
  }
  saveCart();
  showToast(`${name} added to cart 🛒`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  if (typeof renderCart === 'function') renderCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  if (typeof renderCart === 'function') renderCart();
}

function checkout() {
  if (cart.length === 0) { showToast('Your cart is empty!', '⚠️'); return; }
  showToast('Order placed! Thank you 🎉');
  cart = [];
  saveCart();
  if (typeof renderCart === 'function') renderCart();
}

// =============================================
// CART PAGE — render
// =============================================
function renderCart() {
  const wrap = document.getElementById('cart-items');
  const totalEl = document.getElementById('total-price');
  const subtotalEl = document.getElementById('subtotal-price');
  const deliveryEl = document.getElementById('delivery-price');
  if (!wrap) return;

  if (cart.length === 0) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">🛒</span>
        <h3>Your cart is empty</h3>
        <p>Add some delicious food to get started</p>
        <a href="menu.html" class="btn btn-primary" style="margin-top:1.5rem">Browse Menu</a>
      </div>`;
    if (totalEl) totalEl.textContent = '$0.00';
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    return;
  }

  wrap.innerHTML = cart.map((item, i) => `
    <div class="cart-item fade-up">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-qty">
        <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
      </div>
      <button class="cart-remove" onclick="removeFromCart(${i})" title="Remove">🗑</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 0 ? 3.99 : 0;
  const total = subtotal + delivery;
  if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
  if (deliveryEl) deliveryEl.textContent = '$' + delivery.toFixed(2);
  if (totalEl) totalEl.textContent = '$' + total.toFixed(2);

  document.querySelectorAll('.fade-up').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 50);
  });
}

// =============================================
// FADE-IN ON SCROLL
// =============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// =============================================
// AUTH HELPERS
// =============================================
function setAuthLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.orig || btn.innerHTML;
    btn.disabled = false;
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function hideMsg(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function signIn() {
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  hideMsg('signin-error');
  if (!email || !password) { showError('signin-error', 'Please fill in all fields.'); return; }
  setAuthLoading('signin-btn', true);
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      notifySignInEmail(email, 'signed in');
      showToast('Signed in to the website successfully 🎉');
      setTimeout(() => location.href = 'index.html', 800);
    })
    .catch(err => { showError('signin-error', err.message); setAuthLoading('signin-btn', false); });
}

function signUp() {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const name = document.getElementById('signup-name').value.trim();
  hideMsg('signup-error');
  if (!email || !password || !name) { showError('signup-error', 'Please fill in all fields.'); return; }
  if (password.length < 6) { showError('signup-error', 'Password must be at least 6 characters.'); return; }
  setAuthLoading('signup-btn', true);
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return cred.user.updateProfile({ displayName: name });
    })
    .then(() => {
      notifySignInEmail(email, 'signed up');
      showToast('Signed up and signed into the website 🌟');
      setTimeout(() => location.href = 'index.html', 800);
    })
    .catch(err => { showError('signup-error', err.message); setAuthLoading('signup-btn', false); });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => { showToast('Signed in with Google 🎉'); setTimeout(() => location.href = 'index.html', 800); })
    .catch(err => showToast(err.message, '❌'));
}

function showSignUp() {
  document.getElementById('signin-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'block';
}

function showSignIn() {
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('signin-form').style.display = 'block';
}

// Update nav sign-in/out
auth.onAuthStateChanged(user => {
  const signInLink = document.querySelector('a[href="auth.html"]');
  if (signInLink) {
    if (user) {
      signInLink.textContent = user.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : 'My Account';
      signInLink.href = '#';
      signInLink.onclick = (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
          auth.signOut().then(() => {
            showToast('Signed out successfully 👋');
            location.href = 'index.html';
          });
        }
      };
    } else {
      signInLink.textContent = 'Sign In';
      signInLink.href = 'auth.html';
      signInLink.onclick = null;
    }
  }
});

// =============================================
// MENU FILTER
// =============================================
function initMenuFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.dish-card[data-cat]');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(c => {
        if (cat === 'all' || c.dataset.cat === cat) {
          c.style.display = '';
        } else {
          c.style.display = 'none';
        }
      });
    });
  });
}

// =============================================
// CONTACT FORM
// =============================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span>';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
      showToast('Message sent! We\'ll reply soon 📧');
      form.reset();
    }, 1500);
  });
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initScrollAnimations();
  initMenuFilter();
  initContactForm();
  if (document.getElementById('cart-items')) renderCart();
});
