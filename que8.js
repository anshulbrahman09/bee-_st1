const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3000;
const ERROR_LOG_FILE = 'errors.log';

function appendToErrorLog(logEntry) {
    fs.appendFile(ERROR_LOG_FILE, logEntry + '\n', (err) => {
        if (err) {
            console.error('Error appending to error log:', err);
        }
    });
}

function manageErrorLogSize() {
    fs.readFile(ERROR_LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading error log:', err);
            return;
        }

        const logEntries = data.split('\n').filter(entry => entry.trim() !== '');
        if (logEntries.length > 5) {
            const newEntries = logEntries.slice(logEntries.length - 5).join('\n');
            fs.writeFile(ERROR_LOG_FILE, newEntries, (err) => {
                if (err) {
                    console.error('Error truncating error log:', err);
                }
            });
        }
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname !== '/about' && pathname !== '/home') {
        const logEntry = `${new Date().toISOString()} - ${req.url}`;
        appendToErrorLog(logEntry);
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Request handled by default endpoint.');
});

manageErrorLogSize();

server.listen(PORT, (err) => {
    if (err) {
        console.error('Unable to start server:', err);
    } else {
        console.log('Server started on port', PORT);
    }
});
