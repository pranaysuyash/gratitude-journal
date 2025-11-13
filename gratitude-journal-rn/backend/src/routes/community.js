const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);
router.get('/feed', (req, res) => res.json({ success: true, feed: [] }));
router.get('/challenges', (req, res) => res.json({ success: true, challenges: [] }));
module.exports = router;
