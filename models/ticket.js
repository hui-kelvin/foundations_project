const uuid = require('uuid');


class Ticket{
    constructor(creator, amount, description) {
        this.ticket_id = uuid.v4();
        this.creator = creator;
        this.amount = amount;
        this.description = description;
        this.status = "Pending"; //pending/approved/denied
    }
}

module.exports = Ticket;