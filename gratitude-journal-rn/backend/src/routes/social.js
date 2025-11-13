const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/feed', (req, res) => res.json({ success: true, feed: [] }));
router.post('/friends/:id/add', (req, res) => res.json({ success: true }));
module.exports = router;
