const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const qs = require('qs');
const Booking = require('../models/Booking');
const bookingRepo = require('../repositories/bookingRepo');

const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

/**
 * Sắp xếp key alphabetically, encode value — đúng chuẩn VNPay (checksum mới khớp).
 * Không dùng encodeURIComponent cho tên key khi sort (tránh lệch chữ ký).
 */
function sortObject(obj) {
    const sorted = {};
    const keys = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            keys.push(encodeURIComponent(key));
        }
    }

    keys.sort();
    for (let i = 0; i < keys.length; i++) {
        const encodedKey = keys[i];
        const rawKey = decodeURIComponent(encodedKey);
        const value = obj[rawKey];
        if (value === undefined || value === null || value === '') continue;
        sorted[encodedKey] = encodeURIComponent(String(value)).replace(/%20/g, '+');
    }
    return sorted;
}

// Lấy IP của Client
function getIpAddress(req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) || '127.0.0.1';
    
    // VNPay only accepts a single standard IPv4, max 15 chars.
    let ipArray = ip.split(',');
    ip = ipArray[0].trim();
    if (ip === '::1' || ip.includes(':')) {
        ip = '127.0.0.1';
    }
    return ip;
}

function buildTxnRef(bookingId) {
    // VNPay expects alphanumeric order ref, avoid special chars like "_".
    return `${String(bookingId)}${Date.now()}`;
}

function extractBookingIdFromTxnRef(txnRef) {
    if (!txnRef) return '';
    const match = String(txnRef).match(/[a-fA-F0-9]{24}/);
    return match ? match[0] : '';
}

router.post('/create_payment_url', async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        const tmnCode = (process.env.vnp_TmnCode || '').trim();
        const secretKey = (process.env.vnp_HashSecret || '').trim();
        const vnpUrl = (process.env.vnp_Url || '').trim();
        const returnUrl = (process.env.vnp_ReturnUrl || '').trim();

        if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
            return res.status(500).json({
                success: false,
                message: 'Thiếu cấu hình VNPay (.env: vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl)',
            });
        }

        if (!bookingId || amount == null || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'bookingId và amount hợp lệ là bắt buộc',
            });
        }

        let ipAddr = getIpAddress(req);

        let date = new Date();
        const pad2 = (n) => String(n).padStart(2, '0');
        let createDate = `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
        
        // Keep bookingId embedded in TxnRef to resolve order at return/IPN.
        let orderId = buildTxnRef(bookingId);

        let locale = 'vn';
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + String(bookingId);
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.floor(Number(amount) * 100); 
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params.vnp_SecureHash = signed;
        const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;

        // Temporary debug for checksum mismatch investigation.
        console.log('[VNPay create] tmnCode:', tmnCode);
        console.log('[VNPay create] secret length:', secretKey.length);
        console.log('[VNPay create] secret preview:', `${secretKey.slice(0, 4)}...${secretKey.slice(-4)}`);
        console.log('[VNPay create] signData:', signData);
        console.log('[VNPay create] secureHash:', signed);
        console.log('[VNPay create] paymentUrl:', paymentUrl);

        res.json({ success: true, vnpUrl: paymentUrl });
    } catch (error) {
        console.error('VNPay Create URL error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/vnpay_ipn', async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        let secretKey = (process.env.vnp_HashSecret || '').trim();
        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];
            let bookingId = extractBookingIdFromTxnRef(orderId);

            let booking = isMssql ? await bookingRepo.getById(bookingId) : await Booking.findById(bookingId);
            if (!booking) {
                return res.status(200).json({RspCode: '01', Message: 'Order not found'});
            }

            if (booking.payment?.status === 'paid') {
                return res.status(200).json({RspCode: '02', Message: 'Order already confirmed'});
            }

            // check amount (bỏ qua bước này nếu không quan trọng)
            if (rspCode === '00') {
                // Success
                const payment = booking.payment || {};
                payment.status = 'paid';
                payment.transactionId = vnp_Params['vnp_TransactionNo'];
                payment.paidAt = new Date();
                payment.method = 'vnpay';
                const nextStatus = booking.status === 'pending' ? 'confirmed' : booking.status;

                if (isMssql) {
                    await bookingRepo.updateBooking(bookingId, {
                        status: nextStatus,
                        paymentJson: JSON.stringify(payment),
                    });
                } else {
                    booking.payment = payment;
                    if (booking.status === 'pending') booking.status = 'confirmed';
                    await booking.save();
                }

                res.status(200).json({RspCode: '00', Message: 'Confirm Success'});
            } else {
                // Failed
                const payment = booking.payment || {};
                payment.status = 'failed';
                payment.method = payment.method || 'vnpay';
                if (isMssql) {
                    await bookingRepo.updateBooking(bookingId, { paymentJson: JSON.stringify(payment) });
                } else {
                    booking.payment = payment;
                    await booking.save();
                }
                res.status(200).json({RspCode: '00', Message: 'Success (but payment failed)'});
            }
        } else {
            res.status(200).json({RspCode: '97', Message: 'Checksum failed'});
        }
    } catch (error) {
        console.error('VNPay IPN Error:', error);
        res.status(200).json({RspCode: '99', Message: 'Unknow error'});
    }
});

router.get('/vnpay_return', async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        let secretKey = (process.env.vnp_HashSecret || '').trim();
        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];
            let bookingId = extractBookingIdFromTxnRef(orderId);

            let booking = isMssql ? await bookingRepo.getById(bookingId) : await Booking.findById(bookingId);
            if (!booking) {
                return res.json({ success: false, message: 'Order not found' });
            }

            if (rspCode === '00') {
                // Success
                if (booking.payment?.status !== 'paid') {
                    const payment = booking.payment || {};
                    payment.status = 'paid';
                    payment.transactionId = vnp_Params['vnp_TransactionNo'];
                    payment.paidAt = new Date();
                    payment.method = 'vnpay';
                    const nextStatus = booking.status === 'pending' ? 'confirmed' : booking.status;

                    if (isMssql) {
                        await bookingRepo.updateBooking(bookingId, {
                            status: nextStatus,
                            paymentJson: JSON.stringify(payment),
                        });
                    } else {
                        booking.payment = payment;
                        if (booking.status === 'pending') booking.status = 'confirmed';
                        await booking.save();
                    }
                }

                return res.json({ success: true, message: 'Payment success', bookingId: booking._id || booking.id });
            } else {
                // Failed
                if (booking.payment?.status !== 'paid') {
                    const payment = booking.payment || {};
                    payment.status = 'failed';
                    payment.method = payment.method || 'vnpay';
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
            return res.json({ success: false, message: 'Checksum failed' });
        }
    } catch (error) {
        console.error('VNPay Return Error:', error);
        res.status(500).json({ success: false, message: 'Internal error' });
    }
});

module.exports = router;
