import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Simulator = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);

    const runSim = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/investments/simulate', {}, {
                headers: { 'x-auth-token': token }
            });
            setResult(res.data);
        } catch(err) {
            setError(err.response?.data?.msg || 'simulation error');
        }
        setLoading(false);
    };

    return (
        <div className='container page'>
            <h1 style={{ marginBottom: '15px' }}>Investment Simulator</h1>
            <p style={{ marginBottom: '15px', color: '#666' }}>
                Runs a 12-month market simulation based on your risk profile thresholds.
            </p>
            <button onClick={runSim} className='btn' disabled={loading}>
                {loading ? 'Running...' : 'Run Simulation'}
            </button>

            {error && <p className='error' style={{ marginTop: '10px' }}>{error}</p>}

            {result && (
                <div style={{ marginTop: '20px' }}>
                    <div className='card' style={{ background: '#d4edda', marginBottom: '15px' }}>
                        <h3>Summary</h3>
                        <p>Total Initial: ${result.summary.totalInitial.toFixed(2)}</p>
                        <p>Total Projected: ${result.summary.totalProjected.toFixed(2)}</p>
                        <p>P/L: ${result.summary.profitLoss.toFixed(2)} ({result.summary.profitLossPercent.toFixed(2)}%)</p>
                        <p>HOLD: {result.summary.holdCount} | SELL: {result.summary.sellCount}</p>
                    </div>

                    <h3 style={{ marginBottom: '10px' }}>Decisions</h3>
                    {result.results.map(r => (
                        <div key={r.investmentId} className='card' style={{
                            borderLeft: r.decision === 'SELL' ? '5px solid #dc3545' : '5px solid #28a745',
                            marginBottom: '10px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4>{r.name} ({r.type})</h4>
                                <span style={{
                                    fontWeight: 'bold',
                                    color: r.decision === 'SELL' ? '#dc3545' : '#28a745'
                                }}>{r.decision}</span>
                            </div>
                            <p>Initial: ${r.initialAmount.toFixed(2)} | Projected: ${r.projectedValue.toFixed(2)}</p>
                            <p>Reason: {r.reason}</p>
                            <details style={{ marginTop: '5px', fontSize: '13px' }}>
                                <summary>Monthly Breakdown</summary>
                                <div style={{ marginTop: '5px' }}>
                                    {r.monthlyReturns.map(m => (
                                        <div key={m.month}>
                                            Month {m.month}: ${m.value.toFixed(2)}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Simulator;
