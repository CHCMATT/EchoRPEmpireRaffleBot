let dsBtn = require('./dsBtn');
let dsModal = require('./dsModal');
var dsStringSelectMenu = require('./dsStringSelectMenu.js');


module.exports = (client) => {
	client.on('interactionCreate', async interaction => {
		try {
			if (interaction.isCommand()) {
				await client.commands[interaction.commandName].execute(interaction);
			}
			else if (interaction.isButton()) {
				await dsBtn.btnPressed(interaction);
			}
			else if (interaction.isModalSubmit()) {
				await dsModal.modalSubmit(interaction);
			}
			else if (interaction.isStringSelectMenu()) {
				await dsStringSelectMenu.stringSelectMenuSubmit(interaction);
			}
			else {
				return;
			}
		}
		catch (error) {
			console.error(error);
			console.log(interaction);
			await interaction.reply({ content: 'There was an error executing this command! Please tag @CHCMATT to fix this issue.', ephemeral: true });
		}
	});
};
