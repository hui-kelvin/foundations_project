const uuid = require('uuid');

class User{
    constructor(username,password) {
        this.username = username;
        this.password = password;
        this.role = "employee"; //default role is employee
    }
}

module.exports = User;