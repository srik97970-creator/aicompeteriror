const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'nethi_mallikarjun_gupta_secret_key';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token formatting error.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
  });
}

module.exports = {
  verifyToken,
  verifyAdmin,
  JWT_SECRET
};
