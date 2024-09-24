import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

const Login = () => {
    const navigate = useNavigate();
    const { loginUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log('Form data being sent:', formData);
        try {
            const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/auth/login`;
            console.log('Sending request to:', apiUrl);
            
            const response = await axios.post(apiUrl, formData, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: function (status) {
                    return status < 500; 
                }
            });
            
            console.log('Full response:', response);
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            if (response.status === 200 && response.data.access_token) {
                const result = await loginUser(formData.username, formData.password);
                if (result.success) {
                    navigate('/calendar');
                } else {
                    setError(`Login error: ${result.message}`);
                }
            } else {
                setError(`Server response: ${response.status} - ${response.data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Axios error:', err);
            if (err.response) {
                console.error('Error response:', err.response);
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                console.error('Error response headers:', err.response.headers);
                setError(`Error: ${err.response.status} - ${err.response.data.message || err.message}`);
            } else if (err.request) {
                console.error('Error request:', err.request);
                setError('No response received from server. Please check your connection.');
            } else {
                console.error('Error message:', err.message);
                setError(`Error: ${err.message}`);
            }
        }
    };
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        name="username"
                        fullWidth
                        margin="normal"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Login
                    </Button>
                </form>
                <Typography sx={{ mt: 2 }}>
                    Don't have an account? <Link to="/register">Register</Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;