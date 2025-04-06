// routes/exchange.js
const express = require('express');
const router = express.Router();
const { createExchangeRequest, updateExchangeRequest } = require('../controllers/exchangeController');

router.post('/request', createExchangeRequest);
router.put('/request/:id', updateExchangeRequest);

module.exports = router;
