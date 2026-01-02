const fetch = require('node-fetch'); // unlikely to be available, use http
const http = require('http');

const data = JSON.stringify({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    username: 'user' + Date.now(),
    fullName: 'Test User'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(data);
req.end();
