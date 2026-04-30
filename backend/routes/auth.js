const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');

// register
router.post('/register', validate, async (req, res) => {
    const { name, email, password, riskProfile } = req.body;

    try {
        let user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({ msg: 'user already exists' });
        }

        user = new User({
            name,
            email,
            password,
            riskProfile: riskProfile || 'moderate'
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: { id: user.id }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if(err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, riskProfile: user.riskProfile } });
        });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

// login
router.post('/login', validate, async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ msg: 'invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ msg: 'invalid credentials' });
        }

        const payload = {
            user: { id: user.id }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if(err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, riskProfile: user.riskProfile } });
        });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

module.exports = router;
