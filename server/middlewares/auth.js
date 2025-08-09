import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default function auth(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    // console.log('Auth Header:', authHeader);
    if (!authHeader) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // ✅ Verify standard JWT
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedUser;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
}
