import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', formData);
            login(res.data.token, res.data.user);
            navigate('/');
        } catch(err) {
            setError(err.response?.data?.msg || 'login failed');
            // console.log(err);
        }
    };

    return (
        <div className='container page'>
            <div className='card' style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Login</h2>
                {error && <p className='error'>{error}</p>}
                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type='email'
                            placeholder='Email'
                            name='email'
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type='password'
                            placeholder='Password'
                            name='password'
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <button type='submit' className='btn' style={{ width: '100%' }}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
