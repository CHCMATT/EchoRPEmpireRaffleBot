let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let raffleTicketsSchema = new Schema({
	citizenId: reqNum,
	charName: reqString,
	phoneNum: reqString,
	ticketsBought: reqNum
});

module.exports = models['raffleTickets'] || model('raffleTickets', raffleTicketsSchema);