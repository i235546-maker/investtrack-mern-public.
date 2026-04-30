import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ background: '#343a40', padding: '10px 0', color: 'white' }}>
            <div className='container' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px' }}>
                    <Link to='/' style={{ color: 'white' }}>InvestTrack</Link>
                </h2>
                <div>
                    {user ? (
                        <>
                            <span style={{ marginRight: '15px' }}>Hello, {user.name}</span>
                            <button onClick={onLogout} className='btn btn-danger'>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to='/login' style={{ color: 'white', marginRight: '15px' }}>Login</Link>
                            <Link to='/signup' style={{ color: 'white' }}>Signup</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
