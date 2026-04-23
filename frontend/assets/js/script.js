'use strict';

/*-----------------------------------*\
  #script.js — MycoMart
\*-----------------------------------*/


/**
 * HEADER — mobile nav toggle
 */
const header       = document.querySelector('[data-header]');
const navOpenBtn   = document.querySelector('[data-nav-open-btn]');
const navCloseBtn  = document.querySelector('[data-nav-close-btn]');
const navbar       = document.querySelector('[data-navbar]');
const overlay      = document.querySelector('[data-overlay]');

const toggleNav = () => {
  navbar.classList.toggle('active');
  overlay.classList.toggle('active');
  document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
};

if (navOpenBtn)  navOpenBtn.addEventListener('click', toggleNav);
if (navCloseBtn) navCloseBtn.addEventListener('click', toggleNav);
if (overlay)     overlay.addEventListener('click', toggleNav);


/**
 * SEARCH toggle
 */
const searchWrapper = document.querySelector('[data-search-wrapper]');
const searchBtn     = document.querySelector('[data-search-btn]');

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    searchWrapper.classList.toggle('active');
  });
}


/**
 * SIDE PANELS — cart & wishlist
 */
const panelBtns    = document.querySelectorAll('[data-panel-btn]');
const sidePanels   = document.querySelectorAll('[data-side-panel]');
const sideOverlay  = document.querySelector('[data-overlay]');

panelBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    const target = this.dataset.panelBtn;

    sidePanels.forEach(panel => {
      if (panel.dataset.sidePanel === target) {
        panel.classList.toggle('active');
        sideOverlay && sideOverlay.classList.toggle('active');
        document.body.style.overflow = panel.classList.contains('active') ? 'hidden' : '';
      }
    });
  });
});


/**
 * BACK TO TOP button
 */
const backTopBtn = document.querySelector('[data-back-top-btn]');

window.addEventListener('scroll', () => {
  if (backTopBtn) {
    backTopBtn.classList.toggle('active', window.scrollY >= 200);
  }

  // sticky header
  if (header) {
    header.classList.toggle('active', window.scrollY >= 100);
  }
});


/**
 * PRODUCT FILTER tabs
 */
const filterBtns  = document.querySelectorAll('[data-filter-btn]');
const productCards = document.querySelectorAll('[data-category]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    // active state
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    const filter = this.dataset.filterBtn;

    productCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});


/**
 * PRODUCT DETAILS — thumbnail gallery
 */
const mainDisplay      = document.querySelector('[data-main-display]');
const thumbnailItems   = document.querySelectorAll('[data-thumbnail]');

thumbnailItems.forEach(thumb => {
  thumb.addEventListener('click', function () {
    if (!mainDisplay) return;

    thumbnailItems.forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    const src = this.querySelector('img')?.src;
    const alt = this.querySelector('img')?.alt;

    if (src) {
      mainDisplay.src = src;
      mainDisplay.alt = alt || '';
      mainDisplay.classList.add('fade-anim');
      mainDisplay.addEventListener('animationend', () => {
        mainDisplay.classList.remove('fade-anim');
      }, { once: true });
    }
  });
});


/**
 * CART — add to cart buttons
 */
const cartBtns      = document.querySelectorAll('[data-add-cart]');
const cartBadge     = document.querySelector('[data-cart-badge]');
let cartCount = parseInt(cartBadge?.textContent || '0');

cartBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    cartCount++;
    if (cartBadge) {
      cartBadge.textContent = String(cartCount).padStart(2, '0');
      cartBadge.setAttribute('value', cartCount);
    }

    // Visual feedback
    const originalText = this.querySelector('span')?.textContent;
    if (originalText) {
      this.querySelector('span').textContent = 'Added!';
      this.style.setProperty('--bg-color', 'var(--forest-green)');
      setTimeout(() => {
        this.querySelector('span').textContent = originalText;
        this.style.removeProperty('--bg-color');
      }, 1500);
    }
  });
});


/**
 * WISHLIST — add to wishlist
 */
const wishBtns   = document.querySelectorAll('[data-add-wish]');
const wishBadge  = document.querySelector('[data-wish-badge]');
let wishCount = parseInt(wishBadge?.textContent || '0');

wishBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    const icon = this.querySelector('ion-icon');
    if (!icon) return;

    if (icon.getAttribute('name') === 'heart-outline') {
      icon.setAttribute('name', 'heart');
      icon.style.color = 'var(--amber-primary)';
      wishCount++;
    } else {
      icon.setAttribute('name', 'heart-outline');
      icon.style.color = '';
      wishCount = Math.max(0, wishCount - 1);
    }

    if (wishBadge) {
      wishBadge.textContent = String(wishCount).padStart(2, '0');
      wishBadge.setAttribute('value', wishCount);
    }
  });
});


/**
 * QUANTITY — product detail page stepper
 */
const qtyInput   = document.querySelector('[data-qty-input]');
const qtyIncrBtn = document.querySelector('[data-qty-incr]');
const qtyDecrBtn = document.querySelector('[data-qty-decr]');

if (qtyIncrBtn && qtyInput) {
  qtyIncrBtn.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value || 1) + 1;
  });
}

if (qtyDecrBtn && qtyInput) {
  qtyDecrBtn.addEventListener('click', () => {
    const v = parseInt(qtyInput.value || 1);
    if (v > 1) qtyInput.value = v - 1;
  });
}


/**
 * NEWSLETTER — basic submit handler
 */
const newsletterForms = document.querySelectorAll('[data-newsletter-form]');

newsletterForms.forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const input  = this.querySelector('input[type="email"]');
    const btn    = this.querySelector('button[type="submit"]');
    const email  = input?.value;

    if (!email) return;

    // Simulate API call
    if (btn) btn.disabled = true;
    setTimeout(() => {
      alert(`🍄 Thank you! You've subscribed with ${email}. Get ready for mushroom magic!`);
      if (input) input.value = '';
      if (btn)   btn.disabled = false;
    }, 800);
  });
});
