let dbCmds = require('./dbCmds.js');
let { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.editEmbed = async (client, buttonStatus) => {
	let countTicketsSold = await dbCmds.readSummValue("countTicketsSold");
	let countUniquePlayers = await dbCmds.readSummValue("countUniquePlayers");

	// Theme Color Palette: https://coolors.co/palette/ae8625-f7ef8a-e5ce69-d2ac47-edc967-eedf7a-f9f295

	countTicketsSold = countTicketsSold.toString();
	countUniquePlayers = countUniquePlayers.toString();

	let raffleItemEmbed = new EmbedBuilder()
		.setTitle(`Mesa XL Raffle`)
		.setImage(`https://i.imgur.com/2sAX1LD.png`)
		.setColor(`AE8625`)

	let ticketsSoldEmbed = new EmbedBuilder()
		.setTitle('Raffle Tickets Sold:')
		.setDescription(countTicketsSold)
		.setColor('D2AC47');

	let uniquePlayersEmbed = new EmbedBuilder()
		.setTitle('Unique Raffle Participants:')
		.setDescription(countUniquePlayers)
		.setColor('EDC967');

	let btnRows = addBtnRows(buttonStatus);

	let currEmbed = await dbCmds.readMsgId("embedMsg");

	let channel = await client.channels.fetch(process.env.EMBED_CHANNEL_ID)
	let currMsg = await channel.messages.fetch(currEmbed);

	currMsg.edit({ embeds: [raffleItemEmbed, ticketsSoldEmbed, uniquePlayersEmbed], components: btnRows });
};

function addBtnRows(buttonStatus) {
	if (buttonStatus == `enabled`) {
		let row1 = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('addTickets')
				.setLabel('Add Tickets Sold')
				.setStyle(ButtonStyle.Success),

			new ButtonBuilder()
				.setCustomId('removeTickets')
				.setLabel('Remove Tickets Sold')
				.setStyle(ButtonStyle.Danger),

			new ButtonBuilder()
				.setCustomId('completeRaffle')
				.setLabel('End Raffle')
				.setStyle(ButtonStyle.Primary),
		);
		let rows = [row1];
		return rows;
	} else {
		let row1 = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('addTickets')
				.setLabel('Add Tickets Sold')
				.setStyle(ButtonStyle.Success)
				.setDisabled(true),

			new ButtonBuilder()
				.setCustomId('removeTickets')
				.setLabel('Remove Tickets Sold')
				.setStyle(ButtonStyle.Danger)
				.setDisabled(true),

			new ButtonBuilder()
				.setCustomId('completeRaffle')
				.setLabel('End Raffle')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(true),
		);
		let rows = [row1];
		return rows;
	}
};