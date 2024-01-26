let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let salespersonStatsSchema = new Schema({
	discordId: reqString,
	charName: reqString,
	ticketsSold: reqNum,
	currentCommission: reqNum
});

module.exports = models['salespersonStats'] || model('salespersonStats', salespersonStatsSchema);