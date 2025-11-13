const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/json', (req, res) => res.json({ success: true, message: 'Export coming soon' }));
router.get('/pdf', (req, res) => res.json({ success: true, message: 'PDF export coming soon' }));
module.exports = router;
