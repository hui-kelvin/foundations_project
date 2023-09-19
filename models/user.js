const uuid = require('uuid');

class user{
    //static ids = 1;
    constructor(username,password) {
        this.id = uuid.v4();
        this.username = username;
        this.password = password;
        this.role = "employee"; //default role is employee
    }
}

module.exports = user;