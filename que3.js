const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3000;
const USERS_FILE_PATH = 'users.txt';
let invalidRequestCount = 0;

function handleSignupRequest(req, res) {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const userData = JSON.parse(body);

                fs.readFile(USERS_FILE_PATH, 'utf8', (err, data) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error('Error reading users file:', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                        return;
                    }

                    let users = [];
                    if (!err) {
                        users = JSON.parse(data);
                    }

                    users.push(userData);

                    fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8', err => {
                        if (err) {
                            console.error('Error writing user data:', err);
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Internal Server Error');
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('User signed up successfully');
                    });
                });
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid JSON data');
            }
        });
    } else if (req.method === 'GET') {
        invalidRequestCount++;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<h1>Invalid request method - ${invalidRequestCount}</h1>`);
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/signup') {
        handleSignupRequest(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, (err) => {
    if (err) {
        console.error('Unable to start server:', err);
    } else {
        console.log('Server started on port', PORT);
    }
});
