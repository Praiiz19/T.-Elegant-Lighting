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
  'Designer floor lamp providing ambient mood lighting.',
  'Handcrafted premium lighting fixture for discerning homeowners.',
  'Majestic lighting piece featuring intricate details and superior materials.',
  'Contemporary minimalist design with premium metallic finish.',
  'Victorian-inspired luxury chandelier for grand interiors.',
  'Art-deco style wall lights with geometric precision.',
  'Nordic-inspired simplicity combined with Nigerian elegance.'
];

const featureSets = [
  ['Hand-finished premium crystal drops', 'Dimmable LED compatible', 'Anti-corrosive metal frame', 'Includes certified wiring', '2-year warranty'],
  ['Brass-plated steel structure', 'Adjustable hanging height', 'Ceramic socket E27 base', 'UL listed components', '1-year warranty'],
  ['Premium K9 crystal elements', 'Luxury gold/silver finish options', 'Easy installation kit included', 'Energy saving bulbs compatible', '3-year warranty'],
  ['Frosted glass diffuser', 'Matte black / Gold duo-tone finish', 'Splash-proof (IP44 rated)', 'Wall-mounted bracket kit', '1-year warranty'],
  ['Ultra-thin flush mount design', 'SMD 2835 LED chips', '3000K warm / 6000K cool selectable', 'Remote control dimming', '2-year warranty'],
  ['Adjustable cord suspension', 'Acrylic diffuser with crystal beads', 'Triac dimming compatible', 'Anti-glare design', '2-year warranty'],
  ['High CRI 90+ LED backlight', 'Ultra-slim 3cm panel', 'No flickering driver', 'Instant start no delay', '3-year warranty'],
  ['Marble base + fabric shade', 'Rotary dimmer switch', 'Elegant linen shade', 'Heavy weighted base', '1-year warranty']
];

const materialSets = [
  { material: 'Crystal + Stainless Steel', dimension: 'Diameter 60cm × Height 90cm', weight: '8.5 kg', bulbs: '6 × E14 (bulbs included)' },
  { material: 'Iron + Acrylic Crystal', dimension: 'Diameter 45cm × Height 120cm', weight: '5.2 kg', bulbs: '3 × GU10 (LED included)' },
  { material: 'Zinc Alloy + Glass', dimension: 'Height 35cm × Projection 22cm', weight: '1.8 kg', bulbs: '2 × E27 (max 40W each)' },
  { material: 'Aluminum + PMMA', dimension: 'Diameter 50cm × Height 12cm', weight: '3.1 kg', bulbs: 'Integrated 48W LED' },
  { material: 'Silicon Steel + Crystal', dimension: 'Diameter 40cm × Height 150cm (adjustable)', weight: '4.5 kg', bulbs: '1 × E27 + 6 × G4' },
  { material: 'Aluminum + Acrylic', dimension: '60 × 60cm (square) × Height 3cm', weight: '2.6 kg', bulbs: 'Integrated 72W CRI 90+' },
  { material: 'Marble + Linen Fabric', dimension: 'Height 165cm (adjustable)', weight: '6.8 kg', bulbs: '3 × E27 (max 60W each)' }
];

const totalImages = 44;

function buildGallery(mainId) {
  const offset = mainId - 1;
  const gallery = [];
  const seen = new Set();
  for (let step = 0; step < totalImages && gallery.length < 6; step++) {
    const idx = ((offset + step * 7) % totalImages) + 1;
    if (!seen.has(idx)) {
      seen.add(idx);
      gallery.push(`light${String(idx).padStart(2, '0')}.jpg`);
    }
  }
  const mainImg = `light${String(mainId).padStart(2, '0')}.jpg`;
  if (!gallery.includes(mainImg)) {
    gallery.unshift(mainImg);
    if (gallery.length > 6) gallery.pop();
  }
  return gallery;
}

const products = [];

for (let i = 1; i <= 44; i++) {
  const catIdx = (i - 1) % categories.length;
  const descIdx = (i - 1) % descriptions.length;
  const featIdx = (i - 1) % featureSets.length;
  const specIdx = (i - 1) % materialSets.length;
  const category = categories[catIdx];
  let filterClass = 'chandelier';
  if (category.includes('Wall')) filterClass = 'wall';
  else if (category.includes('Ceiling') || category.includes('LED') || category.includes('Pendant') || category.includes('Floor')) filterClass = 'ceiling';

  const base = materialSets[specIdx];

  products.push({
    id: i,
    name: `${category} Model ${String(i).padStart(2, '0')}`,
    category: category,
    filterClass: filterClass,
    image: `light${String(i).padStart(2, '0')}.jpg`,
    gallery: buildGallery(i),
    description: descriptions[descIdx],
    longDescription: `${descriptions[descIdx]} Crafted with meticulous attention to detail, this piece has been carefully curated to elevate residential, hospitality and commercial spaces across Nigeria. It arrives professionally packaged to ensure safe nationwide delivery to Lagos, Abuja, Port Harcourt, Kano and beyond.`,
    price: 'Contact for Price',
    featured: i <= 8,
    features: featureSets[featIdx],
    specifications: {
      ...base,
      'Light Source': base.bulbs,
      'Voltage': 'AC 220V – 240V / 50Hz (Nigeria standard)',
      'Finish': category.includes('Crystal') ? 'Polished Gold' : category.includes('Modern') ? 'Matte Black with Gold Accents' : 'Premium Metallic',
      'Installation Type': category.includes('Wall') ? 'Wall Mount' : category.includes('Floor') ? 'Floor Standing' : 'Suspended / Surface Mount'
    },
    sku: `TCL-${String(i).padStart(4, '0')}`
  });
}

module.exports = products;
