module.exports = function(req, res, next) {
    const { name, email, password } = req.body;

    if(req.path === '/register') {
        if(!name || !email || !password) {
            return res.status(400).json({ msg: 'please enter all fields' });
        }
        if(password.length < 6) {
            return res.status(400).json({ msg: 'password min 6 chars' });
        }
    }

    if(req.path === '/login') {
        if(!email || !password) {
            return res.status(400).json({ msg: 'please enter all fields' });
        }
    }

    next();
};
