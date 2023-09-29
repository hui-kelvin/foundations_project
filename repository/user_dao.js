const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const  docClient = new AWS.DynamoDB.DocumentClient();

// function checkUserExists(username) {
//     const params = {
//         TableName: 'users',
//         IndexName: 'username',
//         KeyConditionExpression: 'username = :u',
//         ExpressionAttributeValues: {
//             ':u': username
//         }
//     }
//     const result = docClient.query(params).promise();
//     return result.Items.length > 0;
// }

function addUser(user) {
    const params = {
        TableName: 'users',
        Item: user
    };
    return docClient.put(params).promise(); //put is docClient's version of create()
}

// Read
// retrieve by username
async function checkUser(username) {
    const params = {
        TableName: 'users',
        FilterExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': username,
        }
    }
    const result = await docClient.scan(params).promise();
    return result;
}

// retrieve by list

function retrieveList() {
    const params = {
        TableName: 'users'
    }
    return docClient.scan(params).promise();
}
// O(n)
// function retrieveListByCat(category) {
//     const params = {
//         TableName: 'users',
//         //FilterExpression: ''
//     }

//     return docClient.scan(params).promise()
// }

//O(1)
function retrieveListByCat() {
    const params = {
        TableName: 'users',
        IndexName: 'category-index',
        KeyConditionExpression: '#c = :value',
        ExpressionAttributeNames: {
            '#c': 'category'
        },
        ExpressionAttributeValues: {
            ':value': category
        },
        Limit: 1
    }
}

// Update
function updateById(id,newRole) {
    const params = {
        TableName: 'users',
        Key: {
            id
        },
        UpdateExpression: 'set #role = :value',
        ExpressionAttributeNames: {
            '#role': 'role'
        },
        ExpressionAttributeValues: {
            ':value':newRole
        }
    }
}

module.exports = { checkUser, addUser, retrieveList, retrieveListByCat, updateById};