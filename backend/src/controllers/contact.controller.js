const emailService = require('../services/email.service');

async function sendContactMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required fields.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address format.",
      });
    }

    await emailService.sendContactFormEmail({ name, email, subject, message });

    return res.status(200).json({
      message: "Your message has been sent successfully! We will get back to you shortly.",
    });

  } catch (error) {
    console.error("Contact Form Email Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to send contact message. Please try again later.",
    });
  }
}

module.exports = {
  sendContactMessage,
};
