const http = require('http');

const data = JSON.stringify({
    email: 'repro_test_' + Date.now() + '@example.com',
    password: 'password123',
    username: 'repro_user_' + Date.now(),
    fullName: 'Repro User'
});

const options = {
    hostname: 'localhost',
    port: 5005, // Verify against the temp server
    path: '/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
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

req.write(data);
req.end();
