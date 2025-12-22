const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const handlebars = require('handlebars');
const  {UserException}  = require('./exceptions/userException');
const port = 3000;
const userController = require('./controllers/userController');

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
        if (pathname === '/style.css' && req.method === 'GET') {
            try {
                const css = fs.readFileSync('./views/style.css', 'utf8');
                res.writeHead(200, { 'Content-Type': 'text/css' });
                return res.end(css);
            } catch (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                return res.end('CSS file not found');
            }
        }
        
        if (pathname === '/' && req.method === 'GET') {
           
           try{
            const users = await userController.showUsers(req, res); 
            if(!users || users.length === 0) throw new UserException('No users found');
            const templateSource = fs.readFileSync('./views/index.hbs', 'utf8');
            const template = handlebars.compile(templateSource);
            const html = template({ users });
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
            }catch(err){
            if(err instanceof UserException){
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('<h1>No users found</h1>');
            }
            else if (err.code === 'ENOENT') {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end('<h1>Template file not found</h1>');
            }
        }
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