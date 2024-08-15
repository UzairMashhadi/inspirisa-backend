const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    try {
        if (!token) {
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const loggedInUser = await prisma.user.findUnique({ where: { id: decoded?.id } });

        if (loggedInUser) {
            req.user = loggedInUser;
        }
    } catch (err) {
        console.error('Authentication error:', err.message);
    }

    next();
};

module.exports = authMiddleware;
