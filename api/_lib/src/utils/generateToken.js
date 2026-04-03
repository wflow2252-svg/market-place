const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  // ✅ لو مفيش JWT_SECRET في الـ env هيرفع error مش يستخدم default
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
