const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3000;
const TODO_FILE_PATH = 'todo.json';

function readTasksFromFile(callback) {
    fs.readFile(TODO_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                callback(null, []);
            } else {
                callback(err);
            }
            return;
        }

        try {
            const tasks = JSON.parse(data);
            callback(null, tasks);
        } catch (parseError) {
            callback(parseError);
        }
    });
}

function writeTasksToFile(tasks, callback) {
    const jsonData = JSON.stringify(tasks, null, 2);
    fs.writeFile(TODO_FILE_PATH, jsonData, 'utf8', callback);
}

function handleAddTask(req, res) {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const task = JSON.parse(body);

                readTasksFromFile((err, tasks) => {
                    if (err) {
                        console.error('Error reading tasks file:', err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                        return;
                    }

                    tasks.push(task);

                    writeTasksToFile(tasks, (err) => {
                        if (err) {
                            console.error('Error writing tasks to file:', err);
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Internal Server Error');
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Task added successfully');
                    });
                });
            } catch (parseError) {
                console.error('Error parsing task data:', parseError);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid JSON data');
            }
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
}

function handleGetTasksByStatus(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    if (query.status && query.status.toLowerCase() === 'pending') {
        readTasksFromFile((err, tasks) => {
            if (err) {
                console.error('Error reading tasks file:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            const pendingTasks = tasks.filter(task => task.status.toLowerCase() === 'pending');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(pendingTasks));
        });
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid or missing status parameter');
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/addtask') {
        handleAddTask(req, res);
    } else if (pathname === '/tasks') {
        handleGetTasksByStatus(req, res);
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
