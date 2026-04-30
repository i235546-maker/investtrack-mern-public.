import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        riskProfile: 'moderate'
    });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/register', formData);
            login(res.data.token, res.data.user);
            navigate('/');
        } catch(err) {
            setError(err.response?.data?.msg || 'signup failed');
        }
    };

    return (
        <div className='container page'>
            <div className='card' style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Signup</h2>
                {error && <p className='error'>{error}</p>}
                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='text' placeholder='Name' name='name' value={formData.name} onChange={onChange} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='email' placeholder='Email' name='email' value={formData.email} onChange={onChange} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type='password' placeholder='Password' name='password' value={formData.password} onChange={onChange} required minLength='6' />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <select name='riskProfile' value={formData.riskProfile} onChange={onChange}>
                            <option value='conservative'>Conservative</option>
                            <option value='moderate'>Moderate</option>
                            <option value='aggressive'>Aggressive</option>
                        </select>
                    </div>
                    <button type='submit' className='btn' style={{ width: '100%' }}>Signup</button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
