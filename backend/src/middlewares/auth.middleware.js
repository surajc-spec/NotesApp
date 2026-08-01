const jwt = require('jsonwebtoken')

async function authAdmin(req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: Missing authentication token"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
         
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                message: "Forbidden: Only administrators can upload notes"
            })
        }
        req.user = decoded;
        next()

    } catch (error) {
        console.log("Error occurred in authAdmin:", error);
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token"
        })
    }
}

async function authUser(req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: Missing authentication token"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded;
        next();

    } catch (error) {
        console.log("Error occurred in authUser:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" })
    }
}

module.exports = { authAdmin, authUser }