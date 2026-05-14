const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Booking = require('../models/Booking');
const bookingRepo = require('../repositories/bookingRepo');

const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

router.post('/create_payment_url', async (req, res) => {
    try {
        const { bookingId, amount } = req.body;
        
        var partnerCode = process.env.MOMO_PARTNER_CODE;
        var accessKey = process.env.MOMO_ACCESS_KEY;
        var secretkey = process.env.MOMO_SECRET_KEY;
        var requestType = "captureWallet";
        var extraData = "";
        var orderInfo = "Thanh toan don hang " + bookingId;
        var orderId = bookingId + "_" + new Date().getTime();
        var requestId = orderId;
        var redirectUrl = process.env.MOMO_RETURN_URL;
        var notifyUrl = process.env.MOMO_NOTIFY_URL; 
        
        var rawSignature = "accessKey="+accessKey+"&amount="+amount+"&extraData="+extraData+"&notifyUrl="+notifyUrl+"&orderId="+orderId+"&orderInfo="+orderInfo+"&partnerCode="+partnerCode+"&redirectUrl="+redirectUrl+"&requestId="+requestId+"&requestType="+requestType;
        
        var signature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
            
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            notifyUrl: notifyUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'vi'
        });

        const response = await axios.post(process.env.MOMO_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        });

        res.json({ success: true, payUrl: response.data.payUrl });

    } catch (error) {
        console.error('MoMo Create URL error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/ipn', async (req, res) => {
    try {
        // MoMo gửi IPN bằng POST request
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.body;

        const secretkey = process.env.MOMO_SECRET_KEY;
        const accessKey = process.env.MOMO_ACCESS_KEY;

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&notifyUrl=${process.env.MOMO_NOTIFY_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&payType=${payType}&redirectUrl=${process.env.MOMO_RETURN_URL}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}`;
        
        const generatedSignature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');

        if (signature === generatedSignature) {
            let bookingId = orderId.split('_')[0];
            let booking = isMssql ? await bookingRepo.getById(bookingId) : await Booking.findById(bookingId);
            
            if (booking && resultCode === 0) { // resultCode = 0 is success
                if (booking.payment?.status !== 'paid') {
                    const payment = booking.payment || {};
                    payment.status = 'paid';
                    payment.transactionId = transId;
                    payment.paidAt = new Date();
                    payment.method = 'momo';
                    const nextStatus = booking.status === 'pending' ? 'confirmed' : booking.status;
                    if (isMssql) {
                        await bookingRepo.updateBooking(bookingId, { status: nextStatus, paymentJson: JSON.stringify(payment) });
                    } else {
                        booking.payment = payment;
                        if (booking.status === 'pending') booking.status = 'confirmed';
                        await booking.save();
                    }
                }
            } else if (booking && resultCode !== 0) {
                const payment = booking.payment || {};
                payment.status = 'failed';
                payment.method = payment.method || 'momo';
                if (isMssql) {
                    await bookingRepo.updateBooking(bookingId, { paymentJson: JSON.stringify(payment) });
                } else {
                    booking.payment = payment;
                    await booking.save();
                }
            }
            res.status(204).send(); // Phản hồi 204 No Content cho MoMo
        } else {
            console.error('MoMo IPN Format Error');
            res.status(400).send('Bad Request');
        }
    } catch (error) {
        console.error('MoMo IPN Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/momo_return', async (req, res) => {
    try {
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.body;

        const secretkey = process.env.MOMO_SECRET_KEY;
        const accessKey = process.env.MOMO_ACCESS_KEY;

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&notifyUrl=${process.env.MOMO_NOTIFY_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&payType=${payType}&redirectUrl=${process.env.MOMO_RETURN_URL}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}`;
        
        const generatedSignature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');

        if (signature === generatedSignature) {
            let bookingId = orderId.split('_')[0];
            let booking = isMssql ? await bookingRepo.getById(bookingId) : await Booking.findById(bookingId);
            
            if (!booking) {
                return res.json({ success: false, message: 'Order not found' });
            }

            if (resultCode == 0) { // Success
                if (booking.payment?.status !== 'paid') {
                    const payment = booking.payment || {};
                    payment.status = 'paid';
                    payment.transactionId = transId;
                    payment.paidAt = new Date();
                    payment.method = 'momo';
                    const nextStatus = booking.status === 'pending' ? 'confirmed' : booking.status;
                    if (isMssql) {
                        await bookingRepo.updateBooking(bookingId, { status: nextStatus, paymentJson: JSON.stringify(payment) });
                    } else {
                        booking.payment = payment;
                        if (booking.status === 'pending') booking.status = 'confirmed';
                        await booking.save();
                    }
                }
                return res.json({ success: true, message: 'Payment success', bookingId: booking._id || booking.id });
            } else {
                if (booking.payment?.status !== 'paid') {
                    const payment = booking.payment || {};
                    payment.status = 'failed';
                    payment.method = payment.method || 'momo';
                    if (isMssql) {
                        await bookingRepo.updateBooking(bookingId, { paymentJson: JSON.stringify(payment) });
                    } else {
                        booking.payment = payment;
                        await booking.save();
                    }
                }
                return res.json({ success: false, message: 'Payment failed' });
            }
        } else {
            return res.json({ success: false, message: 'Signature mismatch' });
        }
    } catch (error) {
        console.error('MoMo Return Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
