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

async function checkProcessed(ticket_id){
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        }
    };

    const retrieved = await docClient.get(params).promise();
    //console.log(retrieved);
    if(retrieved.Item.status !== "Pending") {
        return true;
    }
    return false;

}

function processTicket(id, newStatus) {
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id: id
        },
        UpdateExpression: 'set #s = :value',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':value': newStatus
        }
    }
    return docClient.update(params).promise();
}

function getPendingTickets() {
    const params = {
        TableName: 'tickets',
        IndexName: 'status-index',
        KeyConditionExpression: '#status = :value',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':value': "Pending"
        }
    };

    return docClient.query(params).promise();
}

function getTicketsByUser(username) {
    const params = {
        TableName: 'tickets',
        FilterExpression: 'creator = :username',
        ExpressionAttributeValues: {
            ':username': username,
        }
    };

    return docClient.scan(params).promise();
}
module.exports = { addTicket, checkProcessed, processTicket, getPendingTickets, getTicketsByUser };