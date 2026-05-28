const express = require('express');
const { createSession, verifyPassword } = require('../middleware/auth');
const { getRegistrationCount } = require('../db');

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'رمز عبور را وارد کنید.' });
  }

  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'رمز عبور اشتباه است.' });
  }

  const token = createSession();
  res.json({
    token,
    count: getRegistrationCount(),
  });
});

module.exports = router;
