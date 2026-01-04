// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtSecret = 'a_very_long_and_super_secret_key_that_is_hard_to_guess';
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, jwtSecret);
            req.user = { userId: decoded.userId, email: decoded.email };
            next();
        } catch (error) { res.status(401).json({ message: 'Not authorized, token failed.' }); }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};
module.exports = { protect };