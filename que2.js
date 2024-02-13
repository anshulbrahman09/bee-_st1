const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 3001;
const PRODUCTS_FILE_PATH = 'products.json';

// Task 1: Create an endpoint to handle "/products?category=cloths"
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname === '/products' && query.category) {
        fs.readFile(PRODUCTS_FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading products file:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }

            try {
                const products = JSON.parse(data);
                const filteredProducts = products.filter(product => product.Category === query.category);

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(filteredProducts));
            } catch (parseError) {
                console.error('Error parsing products JSON:', parseError);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
            }
        });
    } else if (pathname === '/filterproducts' && query.category && query.price) {
        // Task 2: Create an endpoint to handle "/filterproducts?category=cloths&price=300"
        fs.readFile(PRODUCTS_FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading products file:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }

            try {
                const products = JSON.parse(data);
                const filteredProducts = products.filter(product => 
                    product.Category === query.category && product.Price >= parseFloat(query.price)
                );

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(filteredProducts));
            } catch (parseError) {
                console.error('Error parsing products JSON:', parseError);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
            }
        });
    } else {
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
