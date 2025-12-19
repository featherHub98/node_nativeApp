const { log } = require('console');
const userService = require('../services/userService');
const url = require('url');

const getBody = (req) => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(body));
    });
};

const getUsers = async (req, res) => {
   
    let users = await userService.getAllUsers(req, res);
    console.log('users in controller : ',users);
    res.end(users);
};

const showUsers = async (req, res) => {
    
    let users = await userService.showAllUsers(req, res);

    return users;
};

const addUser = async (req, res) => {
    const body = await getBody(req);
    let newUser =JSON.parse(body);
    console.log("new user",newUser);
    
    let msg = await userService.addUser(req, res, newUser);
    res.end(msg);
}
const updateUser = async (req,res) =>{
     const { id } = req.params;
    if (!id) {
        res.writeHead(400);
        return res.end('User ID is required in URL (e.g., /users/123)');
    }
     
    const body = await getBody(req);
    console.log('body : ',body.user);
    let updatedUser = JSON.parse(body);
    
    updatedUser.id = id
    
    let msg = await userService.updateUser(req,res,updatedUser);
    res.end(msg)
}
const deleteUser = async (req,res) =>{
    const { id } = req.params;
    
    if (!id) {
        res.writeHead(400);
        return res.end('User ID is required in URL (e.g., /users/123)');
    }
    const deleteUser = { id: id }; 
    
    let msg = await userService.deleteUser(req,res,deleteUser);
    res.end(msg)
}



module.exports = { getUsers, addUser,updateUser,deleteUser ,showUsers};