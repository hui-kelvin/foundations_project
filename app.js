const express = require('express');
const server = express();

const User = require('./models/user');
const Ticket = require('./models/ticket');
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

const validateTicketFields = (req, res, next) => {
    if(!req.body.amount || !req.body.description){
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
            res.statusCode = 400;
            res.send({message:'Username already exists, please choose another.'});
        } else {
            const newUser = new User(username,password);
            userDao.addUser(newUser)
                .then((data) => {
                    res.statusCode = 201;
                    res.send({message: "Successfully registered!"})
                })
                .catch((err) => {
                    res.statusCode = 400;
                    res.send({message: "Failed to register!"})
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
                res.statusCode = 202;
                res.send({
                    message:  `Successfully authenticated. Welcome ${retrievedUser.username}`,
                    token: token
                })
            } else {
                res.statusCode = 400;
                res.send({message: "Incorrect password."});
            }
        } else {
            res.statusCode = 400;
            res.send({message: "Account does not exist."});
        }
    }
})

server.post('/submitTicket',validateTicketFields, async(req,res) => {
    const body = req.body;
    if(body.valid) {
        const { amount, description } = body;
        const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
        try {
            const payload = await jwtUtil.verifyTokenAndReturnPayload(token)
            if(payload.role === 'employee'){
                const newTicket = new Ticket(payload.username,amount,description);
                try {
                    const result = await ticketDao.addTicket(newTicket)
                    res.send({message: `Successfully submitted ticket by ${payload.username}`})
                }catch{
                    res.statusCode = 400;
                    res.send({message: "Failed to submit ticket."})
                }
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an employee, you are a ${payload.role}`
                })
            }
        }catch{
            res.statusCode = 401;
            res.send({message: "Failed to authenticate token"});
        }
    } else {
        res.statusCode = 400;
        res.send({message: "Please provide the ticket with both an amount and a description."});
    }
})

server.put('/process/:ticketId', async (req, res) => {
    const ticket_id = req.params.ticketId;
    const newStatus = (req.body.newStatus);
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    try {
        const payload = await jwtUtil.verifyTokenAndReturnPayload(token)
        if(payload.role === 'manager'){
            const ifProcessed = await ticketDao.checkProcessed(ticket_id);
            if(ifProcessed) {
                res.statusCode = 400;
                res.send({message: 'Ticket has already been processed'});
            } else {
                await ticketDao.processTicket(ticket_id, newStatus);
                res.statusCode = 202;
                res.send({message: `Ticket ID: ${ticket_id} has been ${newStatus}`});
            }
        }else{
            res.statusCode = 403;
            res.send({message: `You are not a manager, you are an ${payload.role}`})
        }
    } catch(err) {
        console.error(err);
        res.statusCode = 401;
        res.send({message: "Failed to Authenticate Token"})
    }

})

server.get('/pending-tickets', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    try {
        const payload = await jwtUtil.verifyTokenAndReturnPayload(token)
        if(payload.role === 'manager'){
            const pendingTickets = await ticketDao.getPendingTickets();
            res.send(pendingTickets.Items);
        }else{
            res.statusCode = 401;
            res.send({message: `You are not a manager, you are an ${payload.role}`})
        }
    } catch(err) {
        console.error(err);
        res.statusCode = 401;
        res.send({message: "Failed to Authenticate Token"})
    }
})

server.get('/tickets', async (req,res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    try {
        const payload = await jwtUtil.verifyTokenAndReturnPayload(token)
        if(payload.role === 'employee'){
            const list = await ticketDao.getTicketsByUser(payload.username);
            res.send(list.Items);
        }else{
            res.statusCode = 401;
            res.send({message: `You are not an employee, you are a ${payload.role}`})
        }
    } catch(err) {
        console.error(err);
        res.statusCode = 401;
        res.send({message: "Failed to Authenticate Token"})
    }
})

server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});

