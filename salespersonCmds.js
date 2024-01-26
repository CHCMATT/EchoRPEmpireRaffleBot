require('discord.js');
let dbCmds = require('./dbCmds.js');

module.exports.initSalesperson = async (client, userId) => {
	let guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
	let user = await guild.members.fetch(userId);
	let initCharName = user.nickname;
	await dbCmds.initSalespersonStats(userId, initCharName);
};