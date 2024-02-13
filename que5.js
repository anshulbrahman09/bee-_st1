const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3001;
const TODO_FILE_PATH = 'todo.json';

function readTasksFromFile(callback) {
    fs.readFile(TODO_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading todo file:', err);
            callback(err);
            return;
        }

        try {
            const tasks = JSON.parse(data);
            callback(null, tasks);
        } catch (parseError) {
            console.error('Error parsing todo JSON:', parseError);
            callback(parseError);
        }
    });
}

function writeTasksToFile(tasks, callback) {
    const jsonData = JSON.stringify(tasks, null, 2);
    fs.writeFile(TODO_FILE_PATH, jsonData, 'utf8', callback);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        readTasksFromFile((err, tasks) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tasks));
        });
    } else if (pathname === '/delete') {
        const query = parsedUrl.query;
        const id = parseInt(query.id);

        readTasksFromFile((err, tasks) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            const filteredTasks = tasks.filter(task => task.id !== id);
            writeTasksToFile(filteredTasks, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(filteredTasks));
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, (err) => {
    if (err) {
        console.error('Unable to start server: unable to start server');
    } else {
        console.log('Server started...');
    }
});
