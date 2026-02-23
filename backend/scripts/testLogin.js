const axios = require('axios');

const testLogin = async () => {
    const roles = [
        { email: 'fleetops@gmail.com', password: 'admin123', name: 'Admin' },
        { email: 'pp@gmail.com', password: 'admin123', name: 'Vendor' },
        { email: 'ketan@gmail.com', password: 'admin123', name: 'Customer' }
    ];

    for (const role of roles) {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: role.email,
                password: role.password
            });
            console.log(`${role.name} Login Success!`);
            console.log('Response Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.error(`${role.name} Login Failed:`, error.response?.data?.message || error.message);
        }
    }
    process.exit(0);
};

testLogin();
