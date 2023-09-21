const uuid = require('uuid');

class User{
    //static ids = 1;
    constructor(username,password) {
        this.user_id = uuid.v4();
        this.username = username;
        this.password = password;
        this.role = "employee"; //default role is employee
    }
}

module.exports = User;