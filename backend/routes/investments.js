const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');
const { checkCryptoThreshold, runSimulation } = require('../utils/thresholdLogic');

// get all investments for logged in user
router.get('/', auth, async (req, res) => {
    try {
        const investments = await Investment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(investments);
    } catch(err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

// add investment
router.post('/', auth, async (req, res) => {
    const { name, type, amount, purchasePrice, stopLossPercent, takeProfitPercent } = req.body;

    try {
        // check if crypto exceeds threshold
        if(type === 'crypto') {
            const allInvestments = await Investment.find({ userId: req.user.id });
            const totalPortfolio = allInvestments.reduce((sum, inv) => sum + inv.amount, 0);
            const currentCrypto = allInvestments
                .filter(inv => inv.type === 'crypto')
                .reduce((sum, inv) => sum + inv.amount, 0);

            const user = await require('../models/User').findById(req.user.id);
            const check = checkCryptoThreshold(currentCrypto, totalPortfolio, parseFloat(amount), user.riskProfile);

            if(!check.allowed) {
                return res.status(400).json({ msg: check.message });
            }
        }

        const newInv = new Investment({
            userId: req.user.id,
            name,
            type,
            amount: parseFloat(amount),
            purchasePrice: parseFloat(purchasePrice),
            stopLossPercent: stopLossPercent || 10,
            takeProfitPercent: takeProfitPercent || 20
        });

        const inv = await newInv.save();
        res.json(inv);
    } catch(err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

// delete investment
router.delete('/:id', auth, async (req, res) => {
    try {
        const inv = await Investment.findById(req.params.id);
        if(!inv) return res.status(404).json({ msg: 'not found' });

        if(inv.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'not authorized' });
        }

        await Investment.findByIdAndDelete(req.params.id);
        res.json({ msg: 'investment removed' });
    } catch(err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

// MEANINGFUL QUERY 1: Aggregation by type with sums and percentages
router.get('/portfolio-summary', auth, async (req, res) => {
    try {
        const summary = await Investment.aggregate([
            { $match: { userId: require('mongoose').Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        const total = summary.reduce((sum, item) => sum + item.totalAmount, 0);
        const withPercent = summary.map(item => ({
            type: item._id,
            totalAmount: item.totalAmount,
            count: item.count,
            percent: total > 0 ? ((item.totalAmount / total) * 100).toFixed(2) : 0
        }));

        res.json({ breakdown: withPercent, total });
    } catch(err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

// MEANINGFUL QUERY 2: Filter large investments (> 1000) sorted by date
router.get('/large-investments', auth, async (req, res) => {
    try {
        const minAmount = parseFloat(req.query.min) || 1000;
        const investments = await Investment.find({
            userId: req.user.id,
            amount: { $gt: minAmount }
        }).sort({ createdAt: -1 });

        res.json(investments);
    } catch(err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

// run simulation
router.post('/simulate', auth, async (req, res) => {
    try {
        const investments = await Investment.find({ userId: req.user.id });
        const user = await require('../models/User').findById(req.user.id);

        if(investments.length === 0) {
            return res.status(400).json({ msg: 'no investments to simulate' });
        }

        const simulation = runSimulation(investments, user.riskProfile);
        res.json(simulation);
    } catch(err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

module.exports = router;
