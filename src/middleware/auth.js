const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acceso Denegado. El token es invalido' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    } catch (error){
        res.status(401).json({message: 'Token invalido'});
    }
};

module.exports = auth;