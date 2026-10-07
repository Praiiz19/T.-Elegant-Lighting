const products = require('../data/products');

const cors = (handler) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return handler(req, res);
};

const readBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try { resolve(JSON.parse(body)); }
    catch { resolve({}); }
  });
});

const inquiries = [];

const handler = async (req, res) => {
  const url = req.url || '';
  const path = url.split('?')[0];
  const pathParts = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  if (pathParts[0] === 'products') {
    if (pathParts[1]) {
      const id = parseInt(pathParts[1]);
      const product = products.find(p => p.id === id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(product);
    }
    const { searchParams } = new URL(url, 'http://localhost');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    let result = [...products];
    if (category && category !== 'all') {
      result = result.filter(p => p.filterClass === category);
    }
    if (featured === 'true') {
      result = result.filter(p => p.featured);
    }
    return res.status(200).json(result);
  }

  if (pathParts[0] === 'contact' && req.method === 'POST') {
    const body = await readBody(req);
    const { name, email, phone, message, productId } = body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }
    const newInquiry = {
      id: Date.now(),
      name,
      email: email || '',
      phone: phone || '',
      message,
      productId: productId || null,
      date: new Date().toISOString()
    };
    inquiries.push(newInquiry);
    return res.status(200).json({
      success: true,
      message: 'Message received successfully!',
      inquiry: newInquiry
    });
  }

  if (pathParts[0] === 'inquiries') {
    return res.status(200).json(inquiries);
  }

  res.status(404).json({ error: 'Not Found', path });
};

module.exports = cors(handler);
