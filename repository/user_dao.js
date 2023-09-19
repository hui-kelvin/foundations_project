const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-west-1'
});

const  docClient = new AWS.DynamoDB.DocumentClient();

// CRUD

// Create
// Add item
function addItem(id,username,password,role) {
    const params = {
        TableName: 'users',
        Item: {
            id,
            username,
            password,
            role
        }
    };

    return docClient.put(params).promise(); //put is docClient's version of create()

}

// Read
// retrieve by id
function retrieveById(id) {
    const params = {
        key: {
            "userId": id
        }
    }

    return docClient.get(params).promise();
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

// Delete
function deleteById(id) {
    const params = {
        TableName: 'users',
        Key: {
            id
        }
    }
}

module.exports = { addItem, retrieveById, retrieveList, retrieveListByCat, updateById};