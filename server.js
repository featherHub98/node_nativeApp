const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const port = 3000;
const userController = require('./controllers/userController');

// Super compact helper
const p = (req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const q = Object.fromEntries(url.searchParams);
    const m = req.url.match(/\/[^\/]+\/([^\/?]+)/);
    return { ...q, id: m?.[1] };
};

const server = http.createServer(async (req, res) => {
  
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.writeHead(204).end();

    const { pathname } = url.parse(req.url);
    
   
    const { id, ...queryParams } = p(req);
    
    
    req.params = id ? { id } : {};
    req.query = queryParams;
    
    try {
        
        if (pathname === '/' && req.method === 'GET') {
           // const viewPath = path.join(__dirname, './view/index.ejs');
           // const htmlContent = fs.readFileSync(viewPath, 'utf-8');
           //res.writeHead(200, { 'Content-Type': 'text/html' });
           // return res.end(htmlContent);
           const users = await userController.getUsers(req, res); // Assuming you have a function to get users
           
            const html = await ejs.render(fs.readFileSync('./view/index.ejs', 'utf8'),  {users} );
            console.log("rendered ", html);
            
            //res.writeHead(200, { 'Content-Type': 'text/html' });
             res.end(html);
        }
        else if (pathname === '/users' && req.method === 'GET') {
            return await userController.getUsers(req, res);
        }
        else if (pathname === '/users' && req.method === 'POST') {
            return await userController.addUser(req, res);
        }
        else if (pathname.startsWith('/users/') && req.method === 'PUT') {
            if (!id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'User ID is required' }));
            }
            return await userController.updateUser(req, res);
        }
        else if (pathname.startsWith('/users/') && req.method === 'DELETE') {
            if (!id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'User ID is required' }));
            }
            return await userController.deleteUser(req, res);
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});