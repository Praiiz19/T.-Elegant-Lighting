const WHATSAPP_NUMBER = '2349016453771';
const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? ''
  : '';

let allProducts = [];
let currentFilter = 'all';

const productGrid = document.getElementById('productGrid');

const skeletonCount = 8;
function renderSkeletons() {
  productGrid.innerHTML = '';
  for (let i = 0; i < skeletonCount; i++) {
    const el = document.createElement('div');
    el.className = 'box';
    el.innerHTML = `
      <div class="img-wrap"><div class="skeleton skeleton-img"></div></div>
      <div class="box-content">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line medium"></div>
        <div class="skeleton skeleton-line" style="height:34px;"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton" style="height:44px;border-radius:12px;"></div>
      </div>`;
    productGrid.appendChild(el);
  }
}

async function loadProducts() {
  renderSkeletons();
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (res.ok) {
      allProducts = await res.json();
    } else {
      throw new Error('API fetch failed');
    }
  } catch (err) {
    allProducts = fallbackProducts();
  }
  renderProducts();
}

function fallbackProducts() {
  const categories = [
    'Crystal Chandelier', 'Modern Chandelier', 'Classic Chandelier',
    'Wall Sconce', 'Ceiling Light', 'Pendant Light', 'LED Panel', 'Floor Lamp'
  ];
  const descriptions = [
    'Exquisite crystal chandelier that radiates opulence and timeless elegance.',
    'Sleek modern design with premium finish, perfect for contemporary interiors.',
    'Classic craftsmanship meets modern engineering in this stunning piece.',
    'Luxurious wall sconce adding warmth and sophistication to any room.',
    'Beautiful flush-mount ceiling light combining style with functionality.',
    'Statement pendant light designed to be the focal point of your space.',
    'Energy-efficient LED panel with elegant diffused lighting.',
    'Designer floor lamp providing ambient mood lighting.'
  ];
  const list = [];
  for (let i = 1; i <= 44; i++) {
    const catIdx = (i - 1) % categories.length;
    const descIdx = (i - 1) % descriptions.length;
    const category = categories[catIdx];
    let filterClass = 'chandelier';
    if (category.includes('Wall')) filterClass = 'wall';
    else if (!category.includes('Chandelier')) filterClass = 'ceiling';
    list.push({
      id: i,
      name: `${category} Model ${String(i).padStart(2, '0')}`,
      category,
      filterClass,
      image: `light${String(i).padStart(2, '0')}.jpg`,
      description: descriptions[descIdx],
      price: 'Contact for Price'
    });
  }
  return list;
}

function renderProducts() {
  productGrid.innerHTML = '';
  const filtered = currentFilter === 'all'
    ? allProducts
    : allProducts.filter(p => p.filterClass === currentFilter);

  if (filtered.length === 0) {
    productGrid.innerHTML = `<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:3rem;">No products found in this category.</p>`;
    return;
  }

  filtered.forEach(p => {
    const waText = encodeURIComponent(`Hello T.Classic Lighting, I'm interested in ${p.name} (Model ${String(p.id).padStart(2, '0')}). Please share more details and pricing.`);
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

    const card = document.createElement('a');
    card.href = `product.html?id=${p.id}`;
    card.className = `box reveal ${p.filterClass}`;
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.style.cursor = 'pointer';
    card.style.transitionDelay = `${Math.min((p.id - 1) * 25, 500)}ms`;
    card.setAttribute('data-product-id', p.id);
    card.innerHTML = `
      <div class="img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect width=%22400%22 height=%22300%22 fill=%22%231c1917%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23d4af37%22 font-size=%2224%22 font-family=%22serif%22>💡 T.Classic</text></svg>';">
      </div>
      <div class="box-content">
        <span class="category-tag">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <div class="price">${p.price}</div>
        <a class="order-btn" href="${waLink}" target="_blank" rel="noopener" data-product-id="${p.id}" onclick="event.stopPropagation(); event.preventDefault ? event.preventDefault() : (event.returnValue = false); window.open(this.href, '_blank', 'noopener'); return false;">
          <span>Order via WhatsApp</span>
          <span>→</span>
        </a>
      </div>`;
    productGrid.appendChild(card);
  });

  requestAnimationFrame(() => {
    productGrid.querySelectorAll('.box.reveal').forEach((el, idx) => {
      setTimeout(() => el.classList.add('active'), idx * 60);
    });
  });
}

function filterProducts(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-buttons button').forEach(btn => {
    btn.classList.toggle('active',
      (category === 'all' && btn.textContent.includes('All')) ||
      (category === 'chandelier' && btn.textContent.includes('Chandelier')) ||
      (category === 'wall' && btn.textContent.includes('Wall')) ||
      (category === 'ceiling' && btn.textContent.includes('Ceiling')));
  });
  renderProducts();
}
window.filterProducts = filterProducts;

function setupScrollReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.box)');
  const onScroll = () => {
    reveals.forEach(el => {
      if (el.classList.contains('active')) return;
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight - 80) {
        el.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupNavScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 120;
    let current = '';
    sections.forEach(s => {
      if (s.offsetTop <= y) current = s.id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href');
      if (href === '#') l.classList.toggle('active', window.scrollY < 100);
      else l.classList.toggle('active', href === `#${current}`);
    });
  }, { passive: true });
}

function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.textContent = '☰';
    });
  });
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const wrap = document.getElementById('contactFormWrap');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim()
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    let success = false;
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      success = res.ok;
    } catch {
      success = false;
    }

    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;

    const existing = wrap.querySelector('.form-success');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    if (success) {
      msg.className = 'form-success';
      msg.textContent = '✓ Thank you! Your message has been received. We will contact you shortly.';
      form.reset();
    } else {
      msg.className = 'form-success';
      msg.style.background = 'rgba(239, 68, 68, 0.1)';
      msg.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      msg.style.color = '#f87171';
      const waText = encodeURIComponent(
        `Hello T.Classic Lighting!\n\nName: ${data.name}\n${data.email ? 'Email: ' + data.email + '\n' : ''}${data.phone ? 'Phone: ' + data.phone + '\n' : ''}\nMessage: ${data.message}`
      );
      msg.innerHTML = `Couldn't send form. Please <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" style="color:#fca5a5;text-decoration:underline;">message us on WhatsApp</a> instead.`;
    }
    wrap.insertBefore(msg, form);

    setTimeout(() => msg.remove(), 10000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupScrollReveal();
  setupNavScrollSpy();
  setupMobileMenu();
  setupContactForm();
});
