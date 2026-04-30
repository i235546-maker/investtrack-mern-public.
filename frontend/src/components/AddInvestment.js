import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const AddInvestment = () => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'stock',
        amount: '',
        purchasePrice: '',
        stopLossPercent: '',
        takeProfitPercent: ''
    });
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/investments', formData, {
                headers: { 'x-auth-token': token }
            });
            navigate('/');
        } catch(err) {
            setError(err.response?.data?.msg || 'failed to add');
        }
    };

    return (
        <div className='container page'>
            <div className='card' style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '15px' }}>Add Investment</h2>
                {error && <p className='error'>{error}</p>}
                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='text' name='name' placeholder='Investment Name (e.g. Apple Stock)' value={formData.name} onChange={onChange} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <select name='type' value={formData.type} onChange={onChange}>
                            <option value='stock'>Stock</option>
                            <option value='crypto'>Crypto</option>
                            <option value='mutualfund'>Mutual Fund</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='number' name='amount' placeholder='Amount Invested' value={formData.amount} onChange={onChange} required min='1' />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='number' name='purchasePrice' placeholder='Purchase Price per Unit' value={formData.purchasePrice} onChange={onChange} required min='0.01' step='0.01' />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='number' name='stopLossPercent' placeholder='Stop Loss % (default: profile based)' value={formData.stopLossPercent} onChange={onChange} min='0' max='100' />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='number' name='takeProfitPercent' placeholder='Take Profit % (default: profile based)' value={formData.takeProfitPercent} onChange={onChange} min='0' max='1000' />
                    </div>
                    <button type='submit' className='btn btn-success' style={{ width: '100%' }}>Add Investment</button>
                </form>
            </div>
        </div>
    );
};

export default AddInvestment;
