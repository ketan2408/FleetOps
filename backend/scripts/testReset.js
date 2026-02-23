const axios = require('axios');

const testReset = async () => {
    try {
        const email = 'ketan@gmail.com';
        const newPassword = 'newpassword123';
        
        console.log(`Testing Forgot Password for ${email}...`);
        const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email,
            newPassword
        });
        console.log('Reset Response:', response.data);

        console.log('Testing Login with NEW password...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password: newPassword
        });
        console.log('Login Success with NEW password!');
        
        // Reset it back to admin123 for consistency
        await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email,
            newPassword: 'admin123'
        });
        console.log('Reset back to admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error.response?.data?.message || error.message);
        process.exit(1);
    }
};

testReset();
