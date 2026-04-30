// threshold logic for investtrack

const profileSettings = {
    conservative: { stopLoss: 5, takeProfit: 10, maxCrypto: 20, volatility: 0.02 },
    moderate: { stopLoss: 10, takeProfit: 20, maxCrypto: 40, volatility: 0.05 },
    aggressive: { stopLoss: 20, takeProfit: 50, maxCrypto: 70, volatility: 0.10 }
};

function checkCryptoThreshold(currentCrypto, totalPortfolio, newAmount, riskProfile) {
    const maxCrypto = profileSettings[riskProfile].maxCrypto;
    const newTotal = totalPortfolio + newAmount;
    const newCryptoTotal = currentCrypto + newAmount;
    const percent = (newCryptoTotal / newTotal) * 100;

    if(percent > maxCrypto) {
        return {
            allowed: false,
            message: `Crypto allocation would be ${percent.toFixed(2)}%. Max allowed for ${riskProfile} is ${maxCrypto}%`
        };
    }
    return { allowed: true };
}

function simulateInvestment(investment, riskProfile) {
    const settings = profileSettings[riskProfile];
    let currentValue = investment.amount;
    const monthlyReturns = [];

    for(let i = 0; i < 12; i++) {
        const change = (Math.random() * (settings.volatility * 2)) - settings.volatility;
        currentValue = currentValue * (1 + change);
        monthlyReturns.push({ month: i+1, value: currentValue });
    }

    const stopLossPrice = investment.amount * (1 - settings.stopLoss / 100);
    const takeProfitPrice = investment.amount * (1 + settings.takeProfit / 100);

    let decision = 'HOLD';
    let reason = 'Within threshold limits';

    if(currentValue <= stopLossPrice) {
        decision = 'SELL';
        reason = `Stop Loss Breached (Limit: ${settings.stopLoss}%)`;
    } else if(currentValue >= takeProfitPrice) {
        decision = 'SELL';
        reason = `Take Profit Hit (Target: ${settings.takeProfit}%)`;
    }

    return {
        investmentId: investment._id,
        name: investment.name,
        type: investment.type,
        initialAmount: investment.amount,
        projectedValue: currentValue,
        monthlyReturns,
        decision,
        reason,
        stopLossPrice,
        takeProfitPrice
    };
}

function runSimulation(investments, riskProfile) {
    const results = investments.map(inv => simulateInvestment(inv, riskProfile));
    const totalInitial = results.reduce((sum, r) => sum + r.initialAmount, 0);
    const totalProjected = results.reduce((sum, r) => sum + r.projectedValue, 0);

    return {
        results,
        summary: {
            totalInitial,
            totalProjected,
            profitLoss: totalProjected - totalInitial,
            profitLossPercent: ((totalProjected - totalInitial) / totalInitial) * 100,
            holdCount: results.filter(r => r.decision === 'HOLD').length,
            sellCount: results.filter(r => r.decision === 'SELL').length
        }
    };
}

module.exports = { checkCryptoThreshold, simulateInvestment, runSimulation, profileSettings };
