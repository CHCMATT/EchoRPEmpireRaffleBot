let { Schema, model, models } = require('mongoose');

let reqString = {
	type: String,
	required: true,
};

let reqNum = {
	type: Number,
	required: true,
};

let raffleSummarySchema = new Schema({
	summaryName: reqString,
	value: reqNum,
	msgId: String
});

module.exports = models['raffleSummary'] || model('raffleSummary', raffleSummarySchema);