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
                    message:  `Successfully Authenticated. Welcome ${retrievedUser.username}`,
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

server.post('/submitTicket',validateTicketFields, async(req,res) => {
    const body = req.body;
    if(body.valid) {
        const { amount, description } = body;
        const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
        jwtUtil.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            if(payload.role === 'employee'){
                const newTicket = new Ticket(payload.username,amount,description);
                ticketDao.addTicket(newTicket)
                    .then((data) => {
                        res.send({
                            message: `Successfully Added Ticket By ${payload.username}`
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                        res.send({
                            message: "Failed to Add Ticket!"
                        })
                    })
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an employee, you are a ${payload.role}`
                })
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send({
                message: "Failed to Authenticate Token"
            })
        })
    }
})

server.patch('/process/:ticketId', async (req, res) => {
    const ticket_id = req.params.ticketId;
    //console.log(ticket_id);
    const newStatus = (req.body.newStatus);
    //console.log(newStatus)
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    const payload = await jwtUtil.verifyTokenAndReturnPayload(token)
    try {
        if(payload.role === 'manager'){
            const ifProcessed = await ticketDao.checkProcessed(ticket_id);
            //console.log(ifProcessed)
            if(ifProcessed) {
                res.statusCode = 400;
                res.send({message: 'Ticket has already been processed'});
            } else {
                await ticketDao.processTicket(ticket_id, newStatus);
                res.send({message: `Ticket ID: ${ticket_id} has been ${newStatus}`});
            }
        }else{
            res.statusCode = 401;
            res.send({message: `You are not a(n) manager, you are a(n) ${payload.role}`})
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
            res.send({message: `You are not a(n) manager, you are a(n) ${payload.role}`})
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
            res.send({message: `You are not a(n) manager, you are a(n) ${payload.role}`})
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

