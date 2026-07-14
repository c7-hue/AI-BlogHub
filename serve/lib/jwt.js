const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'rtfdgfdrewtycgd';

// 生成 token
exports.generateToken = function (e) {
    let payload = { id: e, time: new Date() };// 生成 token 时的时间戳
    let token = jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 * 30 }); // 30天过期
    return token;
};

// 解码/验证 token
exports.verifyToken = function (e) {
    try {
        return jwt.verify(e, secret);
    } catch (error) {
        return null;
    }
};
