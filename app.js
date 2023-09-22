const express = require('express');
const server = express();

const User = require('./models/user');
const userDao  = require('./repository/user_dao');
const ticketDao = require('./repository/ticket_dao');
const jwtUtil = require('./utility/jwt_util')
const PORT = 3000;

const bodyParser = require('body-parser');

server.use(bodyParser.json());

const validateCredFields = (req, res, next) => {
    if(!req.body.username || !req.body.password){
        req.body.valid = false;
        next();
    }else{
        req.body.valid = true;
        next();
    }
}

server.post('/register',validateCredFields, async(req,res) => {
    const body = req.body;
    if(body.valid) {
        const { username, password } = body;
        const results = await userDao.checkUser(username);
        if(results.Items.length > 0) {
            res.send('Username already used.');
        } else {
            const newUser = new User(username,password);
            userDao.addUser(newUser)
                .then((data) => {
                    res.send({
                        message: "Successfully Registered!"
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.send({
                        message: "Failed to register!"
                    })
                })
        }
    }
})

server.post('/login',validateCredFields, async(req,res) => {
    const body = req.body;
    if(body.valid) {
        const { username, password } = body;
        const results = await userDao.checkUser(username);
        if(results.Items.length > 0) {
            const retrievedUser = results.Items[0];
            if(retrievedUser.password === password) {
                const token = jwtUtil.createJWT(retrievedUser.username, retrievedUser.role);
                res.send({
                    message:  "Successfully Authenticated",
                    token: token
                })
            } else {
                res.statusCode = 400;
                res.send({message: "Invalid Credentials"});
            }
        } else {
            res.send({message: "Username Does Not Exist."});
        }
    }
})
server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});

