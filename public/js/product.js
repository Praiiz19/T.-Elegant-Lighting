const WHATSAPP_NUMBER = '2349016453771';
const API_BASE = '';

const qs = new URLSearchParams(window.location.search);
const productId = parseInt(qs.get('id') || '0', 10);

let currentProduct = null;
let currentGalleryIndex = 0;

const el = (id) => document.getElementById(id);

function getParam(name, fallback = '') {
  const v = qs.get(name);
  return v ? v : fallback;
}

async function loadAllProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (res.ok) return await res.json();
  } catch (_) {}
  return fallbackProducts();
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
  const featureSets = [
    ['Hand-finished premium crystal drops', 'Dimmable LED compatible', 'Anti-corrosive metal frame', 'Includes certified wiring', '2-year warranty'],
    ['Premium K9 crystal elements', 'Luxury gold/silver finish options', 'Easy installation kit included', 'Energy saving bulbs compatible', '3-year warranty']
  ];
  const specs = {
    material: 'Crystal + Stainless Steel',
    dimension: 'Diameter 60cm × Height 90cm',
    weight: '8.5 kg',
    bulbs: '6 × E14 (bulbs included)',
    'Light Source': '6 × E14 (bulbs included)',
    'Voltage': 'AC 220V – 240V / 50Hz (Nigeria standard)',
    'Finish': 'Polished Gold',
    'Installation Type': 'Suspended / Surface Mount'
  };
  const list = [];
  for (let i = 1; i <= 44; i++) {
    const catIdx = (i - 1) % categories.length;
    const descIdx = (i - 1) % descriptions.length;
    const featIdx = (i - 1) % featureSets.length;
    const category = categories[catIdx];
    let filterClass = 'chandelier';
    if (category.includes('Wall')) filterClass = 'wall';
    else if (!category.includes('Chandelier')) filterClass = 'ceiling';
    const gallery = [];
    for (let s = 0; s < 6; s++) gallery.push(`light${String(((i - 1 + s * 7) % 44) + 1).padStart(2, '0')}.jpg`);
    if (!gallery.includes(`light${String(i).padStart(2, '0')}.jpg`)) gallery.unshift(`light${String(i).padStart(2, '0')}.jpg`);
    if (gallery.length > 6) gallery.pop();
    list.push({
      id: i,
      name: `${category} Model ${String(i).padStart(2, '0')}`,
      category,
      filterClass,
      image: `light${String(i).padStart(2, '0')}.jpg`,
      gallery,
      description: descriptions[descIdx],
      longDescription: `${descriptions[descIdx]} Crafted with meticulous attention to detail, this piece has been carefully curated to elevate residential, hospitality and commercial spaces across Nigeria. It arrives professionally packaged to ensure safe nationwide delivery to Lagos, Abuja, Port Harcourt, Kano and beyond.`,
      price: 'Contact for Price',
      featured: i <= 8,
      features: featureSets[featIdx],
      specifications: { ...specs },
      sku: `TCL-${String(i).padStart(4, '0')}`
    });
  }
  return list;
}

function setGalleryIndex(i, wrap) {
  if (!currentProduct) return;
  const g = currentProduct.gallery;
  const n = g.length;
  if (wrap) i = ((i % n) + n) % n;
  else i = Math.max(0, Math.min(n - 1, i));
  currentGalleryIndex = i;
  const img = el('mainImage');
  const thumbEls = document.querySelectorAll('.thumb');
  img.classList.add('switching');
  setTimeout(() => {
    img.src = g[i];
    img.alt = `${currentProduct.name} - view ${i + 1}`;
    el('imageCounter').textContent = `${i + 1} / ${n}`;
    thumbEls.forEach((t, idx) => t.classList.toggle('active', idx === i));
    requestAnimationFrame(() => img.classList.remove('switching'));
  }, 180);
}

function preloadGallery(images) {
  images.forEach(src => { const im = new Image(); im.src = src; });
}

function renderProduct(p) {
  currentProduct = p;
  currentGalleryIndex = 0;
  document.title = `${p.name} | T.Classic Lighting`;
  document.querySelector('meta[name="description"]').setAttribute('content', p.description);

  el('crumbCategory').textContent = p.category;
  el('crumbName').textContent = p.name;
  el('pCategory').textContent = p.category;
  el('pName').textContent = p.name;
  el('pSku').textContent = `SKU: ${p.sku}`;
  el('pDescription').textContent = p.description;
  el('pLongDescription').textContent = p.longDescription;
  document.getElementById('inqName').textContent = p.name;

  const waText = encodeURIComponent(
    `Hello T.Classic Lighting, I'm interested in:\n\n🏷 ${p.name}\n🔗 SKU: ${p.sku}\n📂 Category: ${p.category}\n\nPlease share the price and availability.`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
  el('orderWaBtn').href = waLink;
  el('ctaWaBtn').href = waLink;

  el('mainImage').src = p.gallery[0];
  el('mainImage').alt = p.name;
  el('imageCounter').textContent = `1 / ${p.gallery.length}`;
  preloadGallery(p.gallery);

  const strip = el('thumbnailStrip');
  strip.innerHTML = '';
  p.gallery.forEach((src, i) => {
    const t = document.createElement('div');
    t.className = 'thumb' + (i === 0 ? ' active' : '');
    t.setAttribute('role', 'button');
    t.setAttribute('aria-label', `View image ${i + 1}`);
    t.innerHTML = `<img src="${src}" alt="${p.name} thumbnail ${i + 1}" loading="lazy">`;
    t.addEventListener('click', () => setGalleryIndex(i, false));
    strip.appendChild(t);
  });

  const feat = el('pFeatures');
  feat.innerHTML = '';
  p.features.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f;
    feat.appendChild(li);
  });

  const grid = el('specsGrid');
  grid.innerHTML = '';
  const specs = p.specifications;
  const labels = [
    { k: 'material', l: 'Material' },
    { k: 'dimension', l: 'Dimensions' },
    { k: 'weight', l: 'Weight' },
    { k: 'Light Source', l: 'Light Source' },
    { k: 'Voltage', l: 'Voltage' },
    { k: 'Finish', l: 'Finish' },
    { k: 'Installation Type', l: 'Installation' },
    { k: 'bulbs', l: 'Bulb Count' }
  ];
  labels.forEach(({ k, l }) => {
    if (!specs[k]) return;
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML = `<span class="spec-label">${l}</span><span class="spec-value">${specs[k]}</span>`;
    grid.appendChild(row);
  });

  el('productLoader').style.display = 'none';
  el('productMain').style.display = 'grid';
  el('productSecondary').style.display = 'grid';
  document.querySelectorAll('.reveal').forEach(r => r.classList.add('active'));

  return p;
}

async function renderRelated(p, allProducts) {
  const related = allProducts
    .filter(x => x.id !== p.id && x.filterClass === p.filterClass)
    .slice(0, 4);
  const list = related.length ? related : allProducts.filter(x => x.id !== p.id).slice(0, 4);
  const grid = el('relatedGrid');
  grid.innerHTML = '';
  list.forEach(rp => {
    const waText = encodeURIComponent(`Hello T.Classic Lighting, I'm interested in ${rp.name} (Model ${String(rp.id).padStart(2, '0')}). Please share more details and pricing.`);
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
    const card = document.createElement('a');
    card.href = `product.html?id=${rp.id}`;
    card.className = `box ${rp.filterClass}`;
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="img-wrap">
        <img src="${rp.image}" alt="${rp.name}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect width=%22400%22 height=%22300%22 fill=%22%231c1917%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23d4af37%22 font-size=%2224%22 font-family=%22serif%22>💡 T.Classic</text></svg>';">
      </div>
      <div class="box-content">
        <span class="category-tag">${rp.category}</span>
        <h3>${rp.name}</h3>
        <p class="desc">${rp.description}</p>
        <div class="price">Contact for Price</div>
        <a class="order-btn" href="${waLink}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
          <span>Order via WhatsApp</span>
          <span>→</span>
        </a>
      </div>`;
    grid.appendChild(card);
  });
}

function setupGalleryNav() {
  el('prevBtn').addEventListener('click', () => setGalleryIndex(currentGalleryIndex - 1, true));
  el('nextBtn').addEventListener('click', () => setGalleryIndex(currentGalleryIndex + 1, true));
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowLeft') setGalleryIndex(currentGalleryIndex - 1, true);
    if (e.key === 'ArrowRight') setGalleryIndex(currentGalleryIndex + 1, true);
  });
}

function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
}

function setupInquiryForm(product) {
  const form = document.getElementById('inquiryForm');
  const wrap = document.getElementById('contactFormWrap');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      productId: product.id,
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      message: `[Re: ${product.name} (SKU ${product.sku})] ` + form.message.value.trim()
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
        body: JSON.stringify(payload)
      });
      success = res.ok;
    } catch (_) { success = false; }

    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;

    const existing = wrap.querySelector('.form-success');
    if (existing) existing.remove();
    const msg = document.createElement('div');
    msg.className = 'form-success';
    if (success) {
      msg.textContent = '✓ Thank you! Your inquiry has been received. We will contact you very shortly.';
      form.reset();
    } else {
      msg.classList.add('error');
      const waText = encodeURIComponent(
        `Hello T.Classic Lighting,\n\nI'd like to inquire about:\n🏷 ${product.name}\n🔗 SKU: ${product.sku}\n\nName: ${payload.name}\nPhone: ${payload.phone}\n${payload.email ? 'Email: ' + payload.email + '\n' : ''}\nMessage: ${form.message.value.trim()}`
      );
      msg.innerHTML = `Couldn't send form. Please <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener">message us on WhatsApp</a> instead.`;
    }
    wrap.insertBefore(msg, form);
    setTimeout(() => msg.remove(), 12000);
  });
}

function setupScrollReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.box)');
  const onScroll = () => {
    reveals.forEach(r => {
      if (r.classList.contains('active')) return;
      if (r.getBoundingClientRect().top < window.innerHeight - 80) {
        r.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

async function init() {
  setupGalleryNav();
  setupMobileMenu();
  setupScrollReveal();

  if (!productId || productId < 1 || productId > 44) {
    el('productLoader').style.display = 'none';
    el('productError').style.display = 'block';
    return;
  }

  const all = await loadAllProducts();
  const p = all.find(x => x.id === productId);
  if (!p) {
    el('productLoader').style.display = 'none';
    el('productError').style.display = 'block';
    return;
  }

  renderProduct(p);
  renderRelated(p, all);
  setupInquiryForm(p);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

document.addEventListener('DOMContentLoaded', init);
