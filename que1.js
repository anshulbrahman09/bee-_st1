const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 3001;
const PRODUCTS_FILE_PATH = 'product.json';

// Task 1: Create a Node.js server
const server = http.createServer((req, res) => {
    // Task 2 & 4: Handle requests to "/" endpoint
    if (req.url === '/' || req.url.startsWith('/?category=')) {
        // Task 2 & 4: Read products from products.json
        fs.readFile(PRODUCTS_FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading products file:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }

            // Task 4: Parse category from query parameters
            const queryObject = url.parse(req.url, true).query;
            const category = queryObject.category;

            try {
                const products = JSON.parse(data);
                let filteredProducts = products;

                // Task 4: Filter products by category if provided
                if (category) {
                    filteredProducts = products.filter(product => product.Category === category);
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(filteredProducts));
            } catch (parseError) {
                console.error('Error parsing products JSON:', parseError);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
            }
        });
    } else {
        // Task 2: Handle other endpoints
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
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
