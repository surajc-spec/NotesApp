const express = require('express');

const ContactMessage = require('../models/ContactMessage');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;

const clean = (value) => String(value || '').trim();

router.post('/', async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email).toLowerCase();
    const subject = clean(req.body.subject);
    const message = clean(req.body.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (message.length < MIN_MESSAGE_LENGTH) {
      return res.status(400).json({ message: 'Message must be at least 10 characters.' });
    }

    const sentThisHour = await ContactMessage.countDocuments({
      email,
      createdAt: { $gte: new Date(Date.now() - ONE_HOUR_MS) },
    });

    if (sentThisHour >= 5) {
      return res.status(429).json({ message: 'Message limit reached. Please try again in one hour.' });
    }

    await ContactMessage.create({ name, email, subject, message });

    return res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to send message right now.' });
  }
});

module.exports = router;
