const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const PORT = 3000;

// Task 1: Function to handle requests to non-existent pages
function handle404Request(req, res) {
    const filePath = path.join(__dirname, '404.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading 404.html:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}

// Task 2: Function to handle requests to /details endpoint
function handleDetailsRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    if (req.method !== 'GET' || !query.id) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid Request');
    } else if (query.id === '') {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Specify the value');
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Request received with value ${query.id}`);
    }
}

// Create a server to handle requests
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/details') {
        handleDetailsRequest(req, res);
    } else {
        handle404Request(req, res);
    }
});

// Start server and handle errors
server.listen(PORT, (err) => {
    if (err) {
        console.error('Unable to start server:', err);
    } else {
        console.log('Server started on port', PORT);
    }
});
