const http = require('http');  //this module allows us to create http server
const fs = require('fs');      //it reads and write files
const path = require('path');       //helps in handling and transforming file paths

const PORT = 3000;          // port number the server will listen on
const DATA_FILE = path.join(__dirname, 'items.json');    //it is the path to JSON file that will store the items

const sendError = (res, statusCode, message) => {   //error responses it takes the response object,a status code and message
    res.writeHead(statusCode);                      //writes status code to the response
    res.end(JSON.stringify({ error: message }));     //sends JSON object with the error message
};

const server = http.createServer((req, res) => {       //takes callback function that gets executed on every incoming request and response
    res.setHeader('Content-Type', 'application/json');   //the Content-type header is set to application/json to indidcate that the server will return JSON data

    switch (req.method) {
        case 'GET':
            if (req.url === '/items') {      //when request is made to /items ,
                fs.readFile(DATA_FILE, 'utf-8', (err, data) => {   //the server reads the items.json file and returns its contents
                    if (err) return sendError(res, 500, 'Could not read data');            //if error occurs it sends status code and error message
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
                req.on('data', chunk => body += chunk.toString());//server listens fore data chunks, concantinates rhem 
                req.on('end', () => {
                    try {
                        const newItem = JSON.parse(body);//attempts to parse the body as JSON
                        fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
                            if (err) return sendError(res, 500, 'Could not read data');
                            const items = JSON.parse(data);
                            items.push(newItem);///IF SUCCESSFUL IT ADDS THE NEW ITEMS TO THE EXISTING LIST
                            fs.writeFile(DATA_FILE, JSON.stringify(items), (err) => {
                                if (err) return sendError(res, 500, 'Could not save data');
                                res.writeHead(201);
                                res.end(JSON.stringify(newItem));
                            });
                        });
                    } catch {
                        sendError(res, 400, 'Invalid JSON');// if not it sends a 400 status code
                    }
                });
            } else {
                sendError(res, 404, 'Not Found');
            }
            break;

        case 'PUT':
            if (req.url.startsWith('/items/')) {//requests to update an item, the server extracts the item ID from the URL
                const id = req.url.split('/')[2];// READS THE EXISTING items, updates the item and the specified index
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
                                res.end(JSON.stringify(updatedItem));//writes the new list back to the file
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
            if (req.url.startsWith('/items/')) {//the server finds and 
                const id = req.url.split('/')[2];//removes the specified item from the list 
                fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
                    if (err) return sendError(res, 500, 'Could not read data');
                    const items = JSON.parse(data);
                    const index = items.findIndex(item => item.id === id);
                    if (index === -1) return sendError(res, 404, 'Item not found');
                    items.splice(index, 1);
                    fs.writeFile(DATA_FILE, JSON.stringify(items), (err) => {
                        if (err) return sendError(res, 500, 'Could not save data');
                        res.writeHead(204);
                        res.end();//updates the file accordingly
                    });
                });
            } else {
                sendError(res, 404, 'Not Found');
            }
            break;

        default:
            sendError(res, 405, 'Method Not Allowed');// it responds with status code indicating that the method is not allowed
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);// server starts listening on the specified port, a message is logged to the console to indicate thet the server is running
});
