const moment = require('moment');
const crypto = require("crypto");
const qs = require('qs');
require('dotenv').config();

const createPaymentLinkAD = (amount, description, ipAddr, transactionID) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const orderId = moment().format('DDHHmmss');
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;

    // Ensure returnUrl includes transactionID & paidAmount
    const returnUrl = `${process.env.VNP_RETURN_URL}?transactionID=${transactionID}&paidAmount=${amount}`;

    const createDate = moment().format('YYYYMMDDHHmmss');

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': description || `Thanh toán cho mã GD: ${orderId}`,
        'vnp_OrderType': 'other',
        'vnp_Amount': amount * 100,  // Convert to VND cents
        'vnp_ReturnUrl': returnUrl,  // Return URL with transactionID and paid amount
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate,
    };

    // Sort parameters properly
    vnp_Params = sortObject(vnp_Params);

    // Generate hash
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    vnp_Params['vnp_SecureHash'] = signed;

    return `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;
};

// Helper function to sort parameters
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

module.exports = {
    createPaymentLinkAD
};
