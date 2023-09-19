const express = require('express');
const server = express();

const userDao  = require('./repository/user_dao');
const ticketDao = require('./repository/ticket_dao');
const uuid = require('uuid');
const PORT = 3000;

const bodyParser = require('body-parser');

server.use(bodyParser.json());

server.get('/',(req,res) => {
    res.send('Hello');
})


server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});

