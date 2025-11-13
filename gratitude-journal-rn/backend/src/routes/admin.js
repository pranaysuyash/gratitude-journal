const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');

router.use(auth, requireAdmin);
router.get('/stats', (req, res) => res.json({ success: true, stats: {} }));
module.exports = router;
