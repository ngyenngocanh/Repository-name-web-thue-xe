const crypto = require('crypto');
const querystring = require('qs');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

let vnp_Params = {};
vnp_Params['vnp_Version'] = '2.1.0';
vnp_Params['vnp_Command'] = 'pay';
vnp_Params['vnp_TmnCode'] = 'CGXZLS0Z';
vnp_Params['vnp_Locale'] = 'vn';
vnp_Params['vnp_CurrCode'] = 'VND';
vnp_Params['vnp_TxnRef'] = '12345_1234567890';
vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang chua 12345';
vnp_Params['vnp_OrderType'] = 'other';
vnp_Params['vnp_Amount'] = 100000;
vnp_Params['vnp_ReturnUrl'] = 'http://localhost:3001/payment/vnpay_return';
vnp_Params['vnp_IpAddr'] = '127.0.0.1';
vnp_Params['vnp_CreateDate'] = '20240415200000';

vnp_Params = sortObject(vnp_Params);

let signData = querystring.stringify(vnp_Params, { encode: false });
console.log('signData:', signData);

let secretKey = 'XNBCJFAKAZQSGTARRLGCHVZCCBGDIGCO';
let hmac = crypto.createHmac("sha512", secretKey);
// We also test without Buffer.from, just straight signData
let hmac2 = crypto.createHmac("sha512", secretKey);

let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
let signed2 = hmac2.update(signData).digest("hex");

console.log('signed (Buffer):', signed);
console.log('signed (string):', signed2);
