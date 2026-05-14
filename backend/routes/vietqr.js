const express = require('express');
const router = express.Router();

router.get('/generate', async (req, res) => {
    try {
        const { amount, bookingId } = req.query;
        
        const bankId = process.env.VIETQR_BANK_ID;
        const accountNo = process.env.VIETQR_ACCOUNT_NO;
        const accountName = encodeURIComponent(process.env.VIETQR_ACCOUNT_NAME);
        const addInfo = encodeURIComponent('Thanh toan don ' + bookingId);
        
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
        
        res.json({ success: true, qrUrl });
    } catch (error) {
        console.error('VietQR Generate Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
