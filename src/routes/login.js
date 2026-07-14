const express = require('express');
const db = require('../config/database');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password) {
        return res.status(400).json({message: 'Es requerido un usuario y contraseña'});
    }

    try {
        const[rows] = await db.query('SELECT * FROM USERS WHERE USERNAME = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({message: 'Usuario o contraseña incorrectos'});
        }

        const user = rows[0];
        const isValidPassword = await bcryptjs.compare(password, user.PASSWORD_USER);

        if (!isValidPassword) {
            return res.status(401).json({message: 'Usuario o contraseña incorrectos'})
        }

        const token = jwt.sign(
            {id: user.ID, username: user.USERNAME },
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );
        res.json({token});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor'})
    }
});

module.exports = router;