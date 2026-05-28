const express = require('express');
const registrationsRouter = require('./registrations');
const adminRouter = require('./admin');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is ready' });
});

router.use('/registrations', registrationsRouter);
router.use('/admin', adminRouter);

module.exports = router;
