require('discord.js');
let dbCmds = require('./dbCmds.js');
let postEmbed = require('./postEmbed.js');
let editEmbed = require('./editEmbed.js');

module.exports.startUp = async (client) => {
	let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID);
	let oldEmbed = await dbCmds.readMsgId("embedMsg");

	try {
		await channel.messages.fetch(oldEmbed);
		await editEmbed.editEmbed(client, `enabled`);
		return "edited";
	}
	catch (error) {
		await postEmbed.postEmbed(client);
		return "posted";
	}
};