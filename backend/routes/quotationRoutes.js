const express = require('express');
const router = express.Router();
const quotationController = require('../mail/quotationController');


router.post('/',  quotationController.sendQuotationRequest);

module.exports = router;