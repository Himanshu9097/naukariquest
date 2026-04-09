const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatController');

// POST /api/chat/message
router.post('/message', sendMessage);

module.exports = router;
