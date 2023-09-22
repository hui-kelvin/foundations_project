const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const  docClient = new AWS.DynamoDB.DocumentClient();

function addTicket(ticket) {
    const params = {
        TableName: 'tickets',
        Item: ticket
    };
    return docClient.put(params).promise(); //put is docClient's version of create()
}

module.exports = { addTicket };