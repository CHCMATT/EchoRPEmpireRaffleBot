let raffleTickets = require('./schemas/raffleTickets.js');
let raffleSummary = require('./schemas/raffleSummary.js');
let salespersonStats = require('./schemas/salespersonStats.js');

// summary data commands
module.exports.readSummValue = async (summaryName) => {
	let result = await raffleSummary.findOne({ summaryName }, { value: 1, _id: 0 });
	if (result !== null) {
		return result.value;
	}
	else {
		return 0;
	}
};

module.exports.addOneSumm = async (summaryName) => {
	await raffleSummary.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: 1 } }, { upsert: true });
};

module.exports.subtractOneSumm = async (summaryName) => {
	await raffleSummary.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: -1 } }, { upsert: true });
};

module.exports.addSummValue = async (summaryName, value) => {
	await raffleSummary.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: value } }, { upsert: true });
};

module.exports.subtractSummValue = async (summaryName, value) => {
	await raffleSummary.findOneAndUpdate({ summaryName: summaryName }, { $inc: { value: -value } }, { upsert: true });
};

module.exports.setSummValue = async (summaryName, newValue) => {
	await raffleSummary.findOneAndUpdate({ summaryName: summaryName }, { value: newValue }, { upsert: true });
};

module.exports.resetSummValue = async (summaryName) => {
	await raffleSummary.findOneAndUpdate({ summaryName: summaryName }, { value: 0 }, { upsert: true });
};

// ticket data
module.exports.addTickets = async (citizenId, name, phoneNum, value) => {
	await raffleTickets.findOneAndUpdate({ citizenId: citizenId }, { $inc: { ticketsBought: value }, charName: name, phoneNum: phoneNum }, { upsert: true });
};

module.exports.removeTickets = async (citizenId, value) => {
	await raffleTickets.findOneAndUpdate({ citizenId: citizenId }, { $inc: { ticketsBought: -value } }, { upsert: true });
};

module.exports.readTickets = async (citizenId) => {
	let result = await raffleTickets.findOne({ citizenId: citizenId }, { ticketsBought: 1, _id: 0 });
	return result;
};

module.exports.resetTickets = async (citizenId) => {
	await raffleTickets.findOneAndUpdate({ citizenId: citizenId }, { ticketsBought: 0 }, { upsert: true });
};

module.exports.readTicketSales = async () => {
	let result = await raffleTickets.find({ ticketsBought: { $gt: 0 } }, { citizenId: 1, charName: 1, ticketsBought: 1, _id: 0 });
	return result;
}

module.exports.lookupPlayerByName = async (charNameInput) => {
	let result = await raffleTickets.findOne({ charName: charNameInput }, { citizenId: 1, charName: 1, ticketsBought: 1, phoneNum: 1, _id: 0 });
	return result;
}



// individual salesperson data commands
module.exports.initSalespersonStats = async (discordId, discordNickname) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { discordId: discordId, charName: discordNickname, ticketsSold: 0, currentCommission: 0 }, { upsert: true });
};

module.exports.resetSalespersonStats = async (discordId) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { ticketsSold: 0, currentCommission: 0 }, { upsert: true });
};

module.exports.readSalespersonStats = async (discordId) => {
	let result = await salespersonStats.findOne({ discordId: discordId }, { discordId: 1, charName: 1, ticketsSold: 1, currentCommission: 1, _id: 0 });
	return result;
};

module.exports.addSalespersonStats = async (discordId, statName, quantity) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: quantity } });
};

module.exports.removeSalespersonStats = async (discordId, statName, quantity) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { $inc: { [statName]: -quantity } });
};



// commission commands
module.exports.addCommission = async (discordId, commission) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: commission } }, { upsert: true });
};

module.exports.removeCommission = async (discordId, commission) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { $inc: { currentCommission: -commission } }, { upsert: true });
};

module.exports.resetCommission = async (discordId) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { currentCommission: 0 });
};

module.exports.resetTicketsSold = async (discordId) => {
	await salespersonStats.findOneAndUpdate({ discordId: discordId }, { ticketsSold: 0 });
};

module.exports.readCommission = async (discordId) => {
	let result = await salespersonStats.findOne({ discordId: discordId }, { currentCommission: 1, _id: 0 });
	return result.currentCommission;
};

module.exports.commissionRep = async () => {
	var result = await salespersonStats.find({ currentCommission: { $gt: 0 } }, { discordId: 1, charName: 1, currentCommission: 1, ticketsSold: 1, _id: 0 });
	return result;
};



// end of raffle commands
module.exports.endOfRaffleSalespersonRep = async () => {
	let result = await salespersonStats.find({ charName: { $ne: null } }, { discordId: 1, charName: 1, ticketsBought: 1, currentCommission: 1, _id: 0 });
	return result;
};



// for setting message ID of current Discord embed message
module.exports.setMsgId = async (summaryName, newValue) => {
	await raffleSummary.findOneAndUpdate({ summaryName: summaryName }, { msgId: newValue }, { upsert: true });
};

module.exports.readMsgId = async (summaryName) => {
	let result = await raffleSummary.findOne({ summaryName }, { msgId: 1, _id: 0 });
	if (result !== null) {
		return result.msgId;
	}
	else {
		return `Value not found for ${summaryName}.`;
	}
};