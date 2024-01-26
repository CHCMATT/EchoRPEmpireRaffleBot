let { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports.btnPressed = async (interaction) => {
	try {
		var buttonID = interaction.customId;
		switch (buttonID) {
			case 'addTickets':
				var addTicketsModal = new ModalBuilder()
					.setCustomId('addTicketsModal')
					.setTitle('Add raffle tickets that you sold');
				var buyerNameInput = new TextInputBuilder()
					.setCustomId('buyerNameInput')
					.setLabel("What is the buyer's full name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName')
					.setRequired(true);
				var citizenIdInput = new TextInputBuilder()
					.setCustomId('citizenIdInput')
					.setLabel("What the buyer's Citizen ID?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('2634')
					.setRequired(true);
				var phoneNumberInput = new TextInputBuilder()
					.setCustomId('phoneNumberInput')
					.setLabel("What the buyer's phone number?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('219-892-4563')
					.setRequired(true);
				var ticketQuantityInput = new TextInputBuilder()
					.setCustomId('ticketQuantityInput')
					.setLabel("How many tickets did they purchase?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('4')
					.setRequired(true);

				var buyerNameInputRow = new ActionRowBuilder().addComponents(buyerNameInput);
				var citizenIdInputRow = new ActionRowBuilder().addComponents(citizenIdInput);
				var phoneNumberInputRow = new ActionRowBuilder().addComponents(phoneNumberInput);
				var ticketQuantityInputRow = new ActionRowBuilder().addComponents(ticketQuantityInput);

				addTicketsModal.addComponents(buyerNameInputRow, citizenIdInputRow, phoneNumberInputRow, ticketQuantityInputRow);

				await interaction.showModal(addTicketsModal);
				break;
			case 'removeTickets':
				var removeTicketsModal = new ModalBuilder()
					.setCustomId('removeTicketsModal')
					.setTitle('Remove raffle tickets that you sold');
				var buyerNameInput = new TextInputBuilder()
					.setCustomId('buyerNameInput')
					.setLabel("What is the former buyer's full name?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('FirstName LastName')
					.setRequired(true);
				var citizenIdInput = new TextInputBuilder()
					.setCustomId('citizenIdInput')
					.setLabel("What is the former buyer's Citizen ID?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('3962')
					.setRequired(true);
				var ticketQuantityInput = new TextInputBuilder()
					.setCustomId('ticketQuantityInput')
					.setLabel("How many tickets should be removed?")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('2')
					.setRequired(true);

				var buyerNameInputRow = new ActionRowBuilder().addComponents(buyerNameInput);
				var citizenIdInputRow = new ActionRowBuilder().addComponents(citizenIdInput);

				var ticketQuantityInputRow = new ActionRowBuilder().addComponents(ticketQuantityInput);

				removeTicketsModal.addComponents(buyerNameInputRow, citizenIdInputRow, ticketQuantityInputRow);

				await interaction.showModal(removeTicketsModal);
				break;
			case 'completeRaffle':
				if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
					var select = new StringSelectMenuBuilder()
						.setCustomId('endRaffleConfirmation')
						.setPlaceholder(`Pick an option...`)
						.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel('Yes, end the raffle!')
								.setDescription('Pick this option to permanently end the Mesa XL raffle.')
								.setValue('confirmEndRaffle'),
							new StringSelectMenuOptionBuilder()
								.setLabel('No, don\'t end the raffle!')
								.setDescription('Pick this option to cancel and allow the raffle to continue running.')
								.setValue('denyEndRaffle'),
						);

					var row = new ActionRowBuilder()
						.addComponents(select);

					await interaction.reply({
						content: `Are you sure you want to end the \`Mesa XL\` raffle?`,
						components: [row],
						ephemeral: true
					});
				} else {
					await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
				}
				break;
			default:
				await interaction.reply({ content: `I'm not familiar with this button press. Please tag @CHCMATT to fix this issue.`, ephemeral: true });
				console.log(`Error: Unrecognized button press: ${interaction.customId}`);
		}
	}
	catch (error) {
		console.log(`Error in button press!`);
		console.error(error);
	}
};