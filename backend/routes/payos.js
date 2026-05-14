const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const bookingRepo = require('../repositories/bookingRepo');

const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

// Lazy-init payOS client to avoid "not a constructor" issues at module load time
let _payos = null;
let _currentPayOSConfig = null;

function getPayOS() {
  const configKey = (process.env.PAYOS_CLIENT_ID || '') + (process.env.PAYOS_API_KEY || '');
  
  if (!_payos || _currentPayOSConfig !== configKey) {
    const payosModule = require('@payos/node');
    const PayOS = payosModule.PayOS || payosModule.default || payosModule;
    
    console.log('[PayOS] Initializing with Client ID:', (process.env.PAYOS_CLIENT_ID || 'MISSING').slice(0, 8) + '...');
    
    _payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY
    });
    _currentPayOSConfig = configKey;
  }
  return _payos;
}

router.post('/create-payment-link', async (req, res) => {
    try {
        const payos = getPayOS();
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ success: false, message: 'Missing bookingId or amount' });
        }

        // payOS orderCode must be a positive integer
        const orderCode = Number(String(Date.now()).slice(-8) + String(Math.floor(Math.random() * 9000) + 1000));

        const body = {
            orderCode: orderCode,
            amount: Math.round(Number(amount)),
            description: `Thanh toan ${String(bookingId).slice(-6).toUpperCase()}`,
            returnUrl: (process.env.PAYOS_RETURN_URL || 'http://localhost:3000/payment/payos_return') + `?bookingId=${bookingId}`,
            cancelUrl: (process.env.PAYOS_CANCEL_URL || 'http://localhost:3000/payment/payos_return') + `?bookingId=${bookingId}`,
        };

        console.log('[PayOS] Creating payment link:', JSON.stringify(body));

        // Save orderCode to booking for webhook lookup later
        if (isMssql) {
            await bookingRepo.updateBooking(bookingId, {
                paymentJson: JSON.stringify({
                    orderCode,
                    method: 'payos',
                    status: 'pending'
                })
            });
        } else {
            await Booking.findByIdAndUpdate(bookingId, {
                'payment.method': 'payos',
                'payment.transactionId': String(orderCode),
                'payment.status': 'pending'
            });
        }

        const paymentLinkResponse = await payos.paymentRequests.create(body);
        console.log('[PayOS] Payment link response:', JSON.stringify(paymentLinkResponse));

        res.json({
            success: true,
            checkoutUrl: paymentLinkResponse.checkoutUrl
        });
    } catch (error) {
        console.error('[PayOS] Create Error:', error.message || error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/webhook', async (req, res) => {
    try {
        const payos = getPayOS();
        console.log('[PayOS] Webhook received:', JSON.stringify(req.body));

        const webhookData = payos.webhooks.verify(req.body);
        console.log('[PayOS] Webhook verified:', JSON.stringify(webhookData));

        if (webhookData && (webhookData.success || webhookData.code === '00')) {
            const orderCode = webhookData.orderCode;

            let booking;
            if (isMssql) {
                const pool = await require('../db/sqlServer').getSqlPool();
                const result = await pool.request()
                    .input('orderCode', require('mssql').NVarChar, `%"orderCode":${orderCode}%`)
                    .query('SELECT * FROM Bookings WHERE paymentJson LIKE @orderCode');
                booking = result.recordset[0];
            } else {
                booking = await Booking.findOne({ 'payment.transactionId': String(orderCode) });
            }

            if (booking) {
                const bookingId = isMssql ? booking.id : booking._id;
                const payment = isMssql ? JSON.parse(booking.paymentJson || '{}') : (booking.payment || {});

                payment.status = 'paid';
                payment.transactionId = webhookData.paymentLinkId || String(orderCode);
                payment.paidAt = new Date();
                payment.method = 'payos';

                const nextStatus = booking.status === 'pending' ? 'confirmed' : booking.status;

                if (isMssql) {
                    await bookingRepo.updateBooking(bookingId, {
                        status: nextStatus,
                        paymentJson: JSON.stringify(payment)
                    });
                } else {
                    booking.payment = payment;
                    if (booking.status === 'pending') booking.status = 'confirmed';
                    await booking.save();
                }
                console.log(`[PayOS] Booking ${bookingId} updated to paid`);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[PayOS] Webhook Error:', error.message || error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/payment-info/:orderCode', async (req, res) => {
    try {
        const payos = getPayOS();
        const paymentInfo = await payos.paymentRequests.get(req.params.orderCode);
        res.json({ success: true, data: paymentInfo });
    } catch (error) {
        console.error('[PayOS] Get Info Error:', error.message || error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
