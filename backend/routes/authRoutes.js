const express = require('express');
const router = express.Router();
const multer = require('multer');
const { register, login } = require('../controllers/authController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);

module.exports = router;
