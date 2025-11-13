const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.use(auth);
router.post('/mint-nft', (req, res) => res.json({ success: true, message: 'NFT minting coming soon' }));
router.get('/nfts', (req, res) => res.json({ success: true, nfts: [] }));
module.exports = router;
