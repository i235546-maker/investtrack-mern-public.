import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
    const [investments, setInvestments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    const config = {
        headers: { 'x-auth-token': token }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, sumRes] = await Promise.all([
                api.get('/investments', config),
                api.get('/investments/portfolio-summary', config)
            ]);
            setInvestments(invRes.data);
            setSummary(sumRes.data);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    };

    const deleteInv = async (id) => {
        if(!window.confirm('Delete this investment?')) return;
        try {
            await api.delete(`/investments/${id}`, config);
            fetchData();
        } catch(err) {
            alert('delete failed');
        }
    };

    const filteredInvestments = investments
        .filter(inv => filterType === 'all' || inv.type === filterType)
        .sort((a, b) => {
            if(sortBy === 'amount') return b.amount - a.amount;
            if(sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });

    if(loading) return <div className='container page'>Loading...</div>;

    return (
        <div className='container page'>
            <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>

            {summary && (
                <div className='card' style={{ marginBottom: '20px', background: '#e9ecef' }}>
                    <h3>Portfolio Summary</h3>
                    <p>Total Invested: <strong>${summary.total?.toFixed(2)}</strong></p>
                    <div style={{ marginTop: '10px' }}>
                        {summary.breakdown?.map(item => (
                            <div key={item.type} style={{ marginBottom: '5px' }}>
                                {item.type}: ${item.totalAmount.toFixed(2)} ({item.count} items, {item.percent}%)
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <div>
                    <label>Filter: </label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value='all'>All</option>
                        <option value='stock'>Stocks</option>
                        <option value='crypto'>Crypto</option>
                        <option value='mutualfund'>Mutual Funds</option>
                    </select>
                </div>
                <div>
                    <label>Sort: </label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value='date'>Date</option>
                        <option value='amount'>Amount</option>
                    </select>
                </div>
                <Link to='/add-investment' className='btn btn-success'>Add Investment</Link>
                <Link to='/simulator' className='btn'>Run Simulation</Link>
            </div>

            {filteredInvestments.length === 0 ? (
                <p>No investments found.</p>
            ) : (
                <div>
                    {filteredInvestments.map(inv => (
                        <div key={inv._id} className='card'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4>{inv.name}</h4>
                                    <p>Type: {inv.type} | Amount: ${inv.amount.toFixed(2)} | Price: ${inv.purchasePrice.toFixed(2)}</p>
                                    <p style={{ fontSize: '12px', color: '#666' }}>
                                        Stop Loss: {inv.stopLossPercent}% | Take Profit: {inv.takeProfitPercent}%
                                    </p>
                                </div>
                                <button onClick={() => deleteInv(inv._id)} className='btn btn-danger'>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
