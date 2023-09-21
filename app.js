const express = require('express');
const server = express();

const User = require('./models/user');
const userDao  = require('./repository/user_dao');
const ticketDao = require('./repository/ticket_dao');
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
    if(req.body.valid) {
        const {username, password } = req.body;
        const results = await userDao.checkUserExists(username);
        if(results == true) {
            res.send('Username already used.');
        } else {
            const newUser = new User(username,password);
            userDao.addUser(newUser)
                .then((data) => {
                    res.send({
                        message: "Successfully Added Item!"
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.send({
                        message: "Failed to Add Item!"
                    })
                })
        }
    }
})


server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});

