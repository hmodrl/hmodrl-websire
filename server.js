require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'officialhmod.rl@gmail.com';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── Data files ──
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file, fallback) {
  const p = path.join(DATA_DIR, file);
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// ── Verification codes store ──
const verificationCodes = new Map();

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Send verification email via Resend ──
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const code = generateCode();
  verificationCodes.set(email.toLowerCase(), { code, expires: Date.now() + 10 * 60 * 1000 });

  try {
    await resend.emails.send({
      from: `AERIALARC <${FROM_EMAIL}>`,
      to: email,
      subject: 'Your AERIALARC Verification Code',
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;background:#0a0a0a;color:#e8e8e8;border-radius:16px;">
          <h1 style="font-size:24px;font-weight:800;margin-bottom:8px;text-align:center;">Verify Your Email</h1>
          <p style="font-size:14px;color:#888;text-align:center;margin-bottom:32px;">Enter this code to complete your login.</p>
          <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#a855f7;">${code}</span>
          </div>
          <p style="font-size:12px;color:#555;text-align:center;">This code expires in 10 minutes.</p>
          <p style="font-size:12px;color:#555;text-align:center;">If you didn't request this, ignore this email.</p>
        </div>
      `
    });
    res.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ── Verify code ──
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

  const stored = verificationCodes.get(email.toLowerCase());
  if (!stored) return res.status(400).json({ error: 'No code sent to this email' });
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email.toLowerCase());
    return res.status(400).json({ error: 'Code expired' });
  }
  if (stored.code !== code) return res.status(400).json({ error: 'Incorrect code' });

  verificationCodes.delete(email.toLowerCase());
  res.json({ success: true, verified: true });
});

// ── Send order confirmation email ──
app.post('/api/send-order-confirmation', async (req, res) => {
  const { email, orderId, items, total } = req.body;
  if (!email || !orderId) return res.status(400).json({ error: 'Email and orderId required' });

  try {
    await resend.emails.send({
      from: `AERIALARC <${FROM_EMAIL}>`,
      to: email,
      subject: `Order Confirmed - ${orderId}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;background:#0a0a0a;color:#e8e8e8;border-radius:16px;">
          <h1 style="font-size:24px;font-weight:800;margin-bottom:8px;text-align:center;">Order Confirmed</h1>
          <p style="font-size:14px;color:#888;text-align:center;margin-bottom:24px;">Thank you for your purchase!</p>
          <div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;color:#888;margin-bottom:8px;">Order ID</p>
            <p style="font-size:20px;font-weight:800;color:#a855f7;margin-bottom:16px;">${orderId}</p>
            <p style="font-size:13px;color:#888;margin-bottom:8px;">Items</p>
            <p style="font-size:14px;margin-bottom:16px;">${items || 'N/A'}</p>
            <p style="font-size:13px;color:#888;margin-bottom:8px;">Total</p>
            <p style="font-size:18px;font-weight:700;">$${Number(total || 0).toFixed(2)}</p>
          </div>
          <p style="font-size:13px;color:#888;text-align:center;">Join our Discord and share your Order ID to get started.</p>
        </div>
      `
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Order email error:', err);
    res.status(500).json({ error: 'Failed to send order email' });
  }
});

// ── Send order status update email ──
app.post('/api/send-status-update', async (req, res) => {
  const { email, orderId, status } = req.body;
  if (!email || !orderId || !status) return res.status(400).json({ error: 'Missing fields' });

  const statusText = { done: 'completed by our team', completed: 'approved and fully completed', pending: 'returned for review' };
  const statusColor = { done: '#fbbf24', completed: '#22c55e', pending: '#ef4444' };

  try {
    await resend.emails.send({
      from: `AERIALARC <${FROM_EMAIL}>`,
      to: email,
      subject: `Order ${orderId} - Status Updated`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;background:#0a0a0a;color:#e8e8e8;border-radius:16px;">
          <h1 style="font-size:24px;font-weight:800;margin-bottom:8px;text-align:center;">Order Update</h1>
          <p style="font-size:14px;color:#888;text-align:center;margin-bottom:24px;">Your order status has changed.</p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;color:#888;margin-bottom:4px;">Order ID</p>
            <p style="font-size:18px;font-weight:800;color:#a855f7;margin-bottom:16px;">${orderId}</p>
            <p style="font-size:13px;color:#888;margin-bottom:4px;">Status</p>
            <p style="font-size:16px;font-weight:700;color:${statusColor[status] || '#fff'};">${statusText[status] || status}</p>
          </div>
        </div>
      `
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Status email error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ── Orders API ──
app.get('/api/orders', (req, res) => {
  const orders = readJSON('orders.json', []);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { id, customer, email, items, meta, total, status, timestamp } = req.body;
  const orders = readJSON('orders.json', []);
  const order = {
    id: id || 'ARC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    customer: customer || 'Guest',
    email: email || '',
    items: items || '',
    meta: meta || '',
    total: total || 0,
    status: status || 'pending',
    timestamp: timestamp || Date.now()
  };
  orders.push(order);
  writeJSON('orders.json', orders);
  res.json({ success: true, order });
});

app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const orders = readJSON('orders.json', []);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  writeJSON('orders.json', orders);
  res.json({ success: true, order });
});

app.delete('/api/orders/:id', (req, res) => {
  let orders = readJSON('orders.json', []);
  orders = orders.filter(o => o.id !== req.params.id);
  writeJSON('orders.json', orders);
  res.json({ success: true });
});

// ── Employees API ──
app.get('/api/employees', (req, res) => {
  const emps = readJSON('employees.json', [
    { email: 'mohammedfortrade777@gmail.com', pass: '00112233Ff#', first: 'Mohammed', last: 'Hassan' }
  ]);
  res.json(emps.map(e => ({ email: e.email, first: e.first, last: e.last })));
});

app.post('/api/employees', (req, res) => {
  const { email, pass, first, last } = req.body;
  if (!email || !pass || !first) return res.status(400).json({ error: 'Missing required fields' });
  const emps = readJSON('employees.json', [
    { email: 'mohammedfortrade777@gmail.com', pass: '00112233Ff#', first: 'Mohammed', last: 'Hassan' }
  ]);
  if (emps.find(e => e.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Employee already exists' });
  }
  emps.push({ email, pass, first, last: last || '' });
  writeJSON('employees.json', emps);
  res.json({ success: true });
});

app.delete('/api/employees/:email', (req, res) => {
  let emps = readJSON('employees.json', []);
  emps = emps.filter(e => e.email !== req.params.email);
  writeJSON('employees.json', emps);
  res.json({ success: true });
});

// ── Employee login ──
app.post('/api/employee-login', (req, res) => {
  const { email, pass } = req.body;
  const emps = readJSON('employees.json', [
    { email: 'mohammedfortrade777@gmail.com', pass: '00112233Ff#', first: 'Mohammed', last: 'Hassan' }
  ]);
  const found = emps.find(e => e.email.toLowerCase() === (email || '').toLowerCase() && e.pass === pass);
  if (!found) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, employee: { email: found.email, first: found.first, last: found.last } });
});

// ── SPA fallback ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AERIALARC server running on port ${PORT}`);
});