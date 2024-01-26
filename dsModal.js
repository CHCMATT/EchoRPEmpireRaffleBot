let dbCmds = require('./dbCmds.js');
let editEmbed = require('./editEmbed.js');
let { EmbedBuilder } = require('discord.js');
let salespersonCmds = require('./salespersonCmds.js');

let formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});

function toTitleCase(str) {
	str = str.toLowerCase().split(' ');
	for (var i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
}

function strCleanup(str) {
	var cleaned = str.replaceAll('`', '-').replaceAll('\\', '-').trimEnd().trimStart();
	return cleaned;
};

module.exports.modalSubmit = async (interaction) => {
	try {
		var modalID = interaction.customId;
		switch (modalID) {
			case 'addTicketsModal':
				var salespersonName;
				if (interaction.member.nickname) {
					salespersonName = interaction.member.nickname;
				} else {
					salespersonName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var saleDate = `<t:${now}:d>`;

				var buyerName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('buyerNameInput')));
				var citizenId = strCleanup(interaction.fields.getTextInputValue('citizenIdInput'));
				var phoneNumber = strCleanup(interaction.fields.getTextInputValue('phoneNumberInput'));
				var numTickets = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('ticketQuantityInput'))));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Mesa XL Raffle!A:G", valueInputOption: "RAW", resource: { values: [[`Add`, `${salespersonName} (<@${interaction.user.id}>)`, saleDate, buyerName, citizenId, phoneNumber, numTickets]] }
				});

				if (isNaN(citizenId)) { // validate citizen id
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('citizenIdInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}
				if (isNaN(numTickets)) { // validate quantity of tickets
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('ticketQuantityInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var indivTicketPrice = 2500;
				var thisSalePrice = (numTickets * indivTicketPrice);
				var salespersonCommission = (thisSalePrice * 0.5);

				var formattedIndivTicketPrice = formatter.format(indivTicketPrice);
				var formattedThisSalePrice = formatter.format(thisSalePrice);
				var formattedSalespersonCommission = formatter.format(salespersonCommission);

				var embeds = [new EmbedBuilder()
					.setTitle('Some Raffle Tickets have been sold!')
					.addFields(
						{ name: `Salesperson Name:`, value: `${salespersonName} (<@${interaction.user.id}>)` },
						{ name: `Sale Date:`, value: `${saleDate}` },
						{ name: `Buyer Name:`, value: `${buyerName}`, inline: true },
						{ name: `Buyer CID:`, value: `${citizenId}`, inline: true },
						{ name: `Buyer Phone Number:`, value: `${phoneNumber}`, inline: true },
						{ name: `Amount of Tickets:`, value: `${numTickets}` },
					)
					.setColor('60d394')];

				await interaction.client.channels.cache.get(process.env.TICKET_SALES_CHANNEL_ID).send({ embeds: embeds });
				var salespersonStats = await dbCmds.readSalespersonStats(interaction.member.user.id);
				if (salespersonStats == null || salespersonStats.charName == null) {
					await salespersonCmds.initSalesperson(interaction.client, interaction.member.user.id);
				}

				let tixData = await dbCmds.readTickets(citizenId);
				let currTixAmt = 0;
				if (tixData !== null) {
					currTixAmt = tixData.ticketsBought;
				}

				if (numTickets > 30) {	// alert if this purchase is more than 30 tickets.  
					await interaction.reply({ content: `:exclamation: Unable to add sale of \`${numTickets}\` tickets to \`${buyerName} (${citizenId})\` as the limit is 30 tickets per person.`, ephemeral: true });
					return;
				} else if (currTixAmt == 30) { // alert if the person already has the 30 tickets.  
					await interaction.reply({ content: `:exclamation: Unable to add sale of \`${numTickets}\` tickets to \`${buyerName} (${citizenId})\` as they have already purchased \`${currTixAmt}\` tickets, so this would put them over the limit. They are not able to purchase any more tickets.`, ephemeral: true });
					return;
				} else if ((currTixAmt + numTickets) > 30) { // alert if the person has less than 30 but this would put them over the limit.
					await interaction.reply({ content: `:exclamation: Unable to add sale of \`${numTickets}\` tickets to \`${buyerName} (${citizenId})\` as they have already purchased \`${currTixAmt}\` tickets, so this would put them over the limit. The maximum number of tickets they can purchase now is: \`${30 - currTixAmt}\`.`, ephemeral: true });
					return;
				} else {

					await dbCmds.addTickets(citizenId, buyerName, phoneNumber, numTickets);
					await dbCmds.addSummValue("countTicketsSold", numTickets);
					await dbCmds.addSalespersonStats(interaction.member.user.id, "ticketsSold", numTickets);
					await dbCmds.addCommission(interaction.member.user.id, salespersonCommission);
					var totalPlayers = await dbCmds.readTicketSales();
					await dbCmds.setSummValue("countUniquePlayers", totalPlayers.length);

					await editEmbed.editEmbed(interaction.client, `enabled`);

					var totalCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
					var reason = `Sale of \`${numTickets}\` tickets to \`${buyerName}\` costing \`${formattedThisSalePrice}\` on ${saleDate}`

					// Success/Failure Color Palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` added \`${formattedSalespersonCommission}\` to <@${interaction.user.id}>'s current commission for a new total of \`${totalCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

					await interaction.reply({ content: `Successfully added \`${numTickets}\` tickets for \`${buyerName}\` to the \`Mesa XL\` raffle.\n\nDetails about this sale:\n> Individual Ticket Price: \`${formattedIndivTicketPrice}\`\n> Total Sale Price: \`${formattedThisSalePrice}\`\n> Your Commission: \`${formattedSalespersonCommission}\`\n\nYour overall commission from this raffle is now: \`${totalCommission}\`.`, ephemeral: true });
				}
				break;
			case 'removeTicketsModal':
				var salespersonName;
				if (interaction.member.nickname) {
					salespersonName = interaction.member.nickname;
				} else {
					salespersonName = interaction.member.user.username;
				}

				var now = Math.floor(new Date().getTime() / 1000.0);
				var removalDate = `<t:${now}:d>`;

				var buyerName = toTitleCase(strCleanup(interaction.fields.getTextInputValue('buyerNameInput')));
				var citizenId = strCleanup(interaction.fields.getTextInputValue('citizenIdInput'));
				var numTickets = Math.abs(Number(strCleanup(interaction.fields.getTextInputValue('ticketQuantityInput'))));

				await interaction.client.googleSheets.values.append({
					auth: interaction.client.sheetsAuth, spreadsheetId: process.env.BACKUP_DATA_SHEET_ID, range: "Mesa XL Raffle!A:G", valueInputOption: "RAW", resource: { values: [[`Remove`, `${salespersonName} (<@${interaction.user.id}>)`, removalDate, buyerName, citizenId, ``, numTickets]] }
				});

				if (isNaN(citizenId)) { // validate citizen id
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('citizenIdInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}
				if (isNaN(numTickets)) { // validate quantity of tickets
					await interaction.reply({
						content: `:exclamation: \`${interaction.fields.getTextInputValue('ticketQuantityInput')}\` is not a valid number, please be sure to only enter numbers.`,
						ephemeral: true
					});
					return;
				}

				var ticketData = await dbCmds.readTickets(citizenId);
				if (ticketData == null) {
					await interaction.reply({
						content: `:exclamation: \`${buyerName}\` does not have any tickets, please check to make sure you're removing from the correct person.`,
						ephemeral: true
					});
					return;
				} else if (ticketData.ticketsBought < numTickets) {
					var ticketsCount = ticketData.ticketsBought
					await interaction.reply({
						content: `:exclamation: \`${buyerName}\` has \`${ticketsCount}\` tickets, please check to make sure you're removing from the correct person.`,
						ephemeral: true
					});
					return;
				} else {

					var indivTicketPrice = 2500;
					var thisSalePrice = (numTickets * indivTicketPrice);
					var salespersonCommission = (thisSalePrice * 0.5);

					var formattedIndivTicketPrice = formatter.format(indivTicketPrice);
					var formattedThisSalePrice = formatter.format(thisSalePrice);
					var formattedSalespersonCommission = formatter.format(salespersonCommission);

					var embeds = [new EmbedBuilder()
						.setTitle('Some Raffle Tickets have been removed!')
						.addFields(
							{ name: `Salesperson Name:`, value: `${salespersonName} (<@${interaction.user.id}>)` },
							{ name: `Removal Date:`, value: `${removalDate}` },
							{ name: `Buyer Name:`, value: `${buyerName}`, inline: true },
							{ name: `Buyer CID:`, value: `${citizenId}`, inline: true },
							{ name: `Amount of Tickets:`, value: `${numTickets}` },
						)
						.setColor('ff9b85')];

					await interaction.client.channels.cache.get(process.env.TICKET_SALES_CHANNEL_ID).send({ embeds: embeds });
					var salespersonStats = await dbCmds.readSalespersonStats(interaction.member.user.id);
					if (salespersonStats == null || salespersonStats.charName == null) {
						await salespersonCmds.initSalesperson(interaction.client, interaction.member.user.id);
					}
					await dbCmds.removeTickets(citizenId, numTickets);
					await dbCmds.subtractSummValue("countTicketsSold", numTickets);
					await dbCmds.removeSalespersonStats(interaction.member.user.id, "ticketsSold", numTickets);
					await dbCmds.removeCommission(interaction.member.user.id, salespersonCommission);
					var totalPlayers = await dbCmds.readTicketSales();
					await dbCmds.setSummValue("countUniquePlayers", totalPlayers.length);

					await editEmbed.editEmbed(interaction.client, `enabled`);

					var totalCommission = formatter.format(await dbCmds.readCommission(interaction.member.user.id));
					var reason = `Removal of \`${numTickets}\` tickets from \`${buyerName}\` refunding \`${formattedThisSalePrice}\` on ${removalDate}`

					// Success/Failure Color Palette: https://coolors.co/palette/706677-7bc950-fffbfe-13262b-1ca3c4-b80600-1ec276-ffa630

					var notificationEmbed = new EmbedBuilder()
						.setTitle('Commission Modified Automatically:')
						.setDescription(`\`System\` removed \`${formattedSalespersonCommission}\` from <@${interaction.user.id}>'s current commission for a new total of \`${totalCommission}\`.\n\n**Reason:** ${reason}.`)
						.setColor('1EC276');
					await interaction.client.channels.cache.get(process.env.COMMISSION_LOGS_CHANNEL_ID).send({ embeds: [notificationEmbed] });

					await interaction.reply({ content: `Successfully removed \`${numTickets}\` tickets for \`${buyerName}\` from the \`Mesa XL\` raffle.\n\nDetails about this sale:\n> Individual Ticket Price: \`-${formattedIndivTicketPrice}\`\n> Total Sale Price: \`-${formattedThisSalePrice}\`\n> Your Commission: \`-${formattedSalespersonCommission}\`\n\nYour overall commission from this raffle is now: \`${totalCommission}\`.`, ephemeral: true });
				}
				break;
			default:
				await interaction.reply({
					content: `I'm not familiar with this modal type. Please tag @CHCMATT to fix this issue.`,
					ephemeral: true
				});
				console.log(`Error: Unrecognized modal ID: ${interaction.customId}`);
		}
	} catch (error) {
		console.log(`Error in modal popup!`);
		console.error(error);
	}
};


