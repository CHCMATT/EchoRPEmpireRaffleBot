let startup = require('../startup.js');
let { PermissionsBitField } = require('discord.js');

module.exports = {
	name: 'startup',
	description: 'Posts the embed to the specified channel',
	async execute(interaction) {
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			const postOrEdit = await startup.startUp(interaction.client);
			await interaction.reply({ content: `Successfully ${postOrEdit} the embed to the <#${process.env.EMBED_CHANNEL_ID}> channel.`, ephemeral: true });
		}
		else {
			await interaction.reply({ content: `:x: You must have the \`Administrator\` permission to use this function.`, ephemeral: true });
		}
	},
};