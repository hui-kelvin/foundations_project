class Ticket{
    constructor(amount, description) {
        this.creatorId;
        this.amount = amount;
        this.description = description;
        this.status = "Pending"; //pending/approved/denied
    }
}