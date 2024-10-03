const http = require('http');    
const fs = require('fs');       
const PORT = 3000; 
const path = require("path");        
const DATA_FILE = path.join(__dirname, 'items.json');    

const sendError = (res, statusCode, message) => {  
    res.writeHead(statusCode);                      
    res.end(JSON.stringify({ error: message }));    
};

const server = http.createServer((req, res) => {     
    res.setHeader('Content-Type', 'application/json');   

    switch (req.method) {
        case 'GET': 
            if (req.url === '/items') {   
                fs.readFile(DATA_FILE, 'utf-8', (err, data) => {   //the server reads the items.json file and returns its contents
                    if (err) return sendError(res, 500, 'Could not read data');          
                    res.writeHead(200);
                    res.end(data);
                });
            } else {
                sendError(res, 404, 'Not Found');
            }
            
            break;

        case 'POST':
            if (req.url === '/items') { 
                let body = '';
                req.on('data', chunk => body += chunk.toString());  
                req.on('end', () => {
                    try {
                        const newItem = JSON.parse(body);    
                        fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
                            if (err) return sendError(res, 500, 'Could not read data');
                            const items = JSON.parse(data);
                            items.push(newItem);     
                            fs.writeFile(DATA_FILE, JSON.stringify(items), (err) => {
                                if (err) return sendError(res, 500, 'Could not save data');
                                res.writeHead(201);
                                res.end(JSON.stringify(newItem));
                            });
                        });
                    } catch {
                        sendError(res, 400, 'Invalid JSON');
                    }
                });
            } else {
                sendError(res, 404, 'Not Found');
            }
            break;

        case 'PUT':
            if (req.url.startsWith('/items/')) {  
                const id = req.url.split('/')[2];    // READS THE EXISTING items, updates the item and the specified index
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', () => {
                    try {
                        const updatedItem = JSON.parse(body);
                        fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
                            if (err) return sendError(res, 500, 'Could not read data');
                            const items = JSON.parse(data);
                            const index = items.findIndex(item => item.id === id);
                            if (index === -1) return sendError(res, 404, 'Item not found');
                            items[index] = updatedItem;
                            fs.writeFile(DATA_FILE, JSON.stringify(items), (err) => {
                                if (err) return sendError(res, 500, 'Could not save data');
                                res.writeHead(200);
                                res.end(JSON.stringify(updatedItem));    //writes the new list back to the file
                            });
                        });
                    } catch {
                        sendError(res, 400, 'Invalid JSON');
                    }
                });
            } else {
                sendError(res, 404, 'Not Found');
            }
            break;

        case 'DELETE':
            if (req.url.startsWith('/items/')) {  //the server finds and 
                const id = req.url.split('/')[2];  //removes the specified item from the list 
                fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
                    if (err) return sendError(res, 500, 'Could not read data');
                    const items = JSON.parse(data);
                    const index = items.findIndex(item => item.id === id);
                    if (index === -1) return sendError(res, 404, 'Item not found');
                    items.splice(index, 1);
                    fs.writeFile(DATA_FILE, JSON.stringify(items), (err) => {
                        if (err) return sendError(res, 500, 'Could not save data');
                        res.writeHead(204);
                        res.end();    //updates the file accordingly
                    });
                });
            } else {
                sendError(res, 404, 'Not Found');
            }
            break;
 
        default:
            sendError(res, 405, 'Method Not Allowed');   // it responds with status code indicating that the method is not allowed
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);  // server starts listening on the specified port, a message is logged to the console to indicate thet the server is running
});








