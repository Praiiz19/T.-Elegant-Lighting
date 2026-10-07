const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const products = require('./data/products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname, {
  extensions: ['jpg', 'jpeg', 'png', 'JPG'],
  setHeaders: (res, filePath) => {
    if (/\.(jpg|jpeg|png|JPG)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

app.get('/api/products', (req, res) => {
  const { category, featured } = req.query;
  let result = [...products];
  if (category && category !== 'all') {
    result = result.filter(p => p.filterClass === category);
  }
  if (featured === 'true') {
    result = result.filter(p => p.featured);
  }
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

const DATA_DIR = path.join(__dirname, 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

function ensureInquiryFile() {
  if (!fs.existsSync(INQUIRIES_FILE)) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2));
  }
}

app.post('/api/contact', (req, res) => {
  const { name, email, phone, message, productId } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }
  ensureInquiryFile();
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
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
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
  res.json({ success: true, message: 'Message received successfully!', inquiry: newInquiry });
});

app.get('/api/inquiries', (req, res) => {
  ensureInquiryFile();
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
  res.json(inquiries);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`T.Classic Lighting server running on http://localhost:${PORT}`);
});

module.exports = app;
