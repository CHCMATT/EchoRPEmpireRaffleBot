const moment = require('moment');

module.exports = (client) => {
	client.on('messageCreate', async message => {
		try {
			if (message.guild == null && message.author.id !== client.user.id) {
				await message.channel.sendTyping();

				let now = Math.floor(new Date().getTime() / 1000.0);

				client.users.send(`177088916250296320`, `${message.author} sent a DM at <t:${now}:T> (<t:${now}:R>):\n> ${message.content}`);

				await message.author.send({ content: `Hi there! I am not able help you via DM, if you have a request or problem, please DM my developer <@177088916250296320> directly.` });
			}
		} catch (error) {
			if (process.env.BOT_NAME == 'test') {
				console.error(error);
			} else {
				console.error(error);

				let errTime = moment().format('MMMM Do YYYY, h:mm:ss a');;
				let fileParts = __filename.split(/[\\/]/);
				let fileName = fileParts[fileParts.length - 1];

				console.log(`Error occured at ${errTime} at file ${fileName}!`);

				let errorEmbed = [new EmbedBuilder()
					.setTitle(`An error occured on the ${process.env.BOT_NAME} bot file ${fileName}!`)
					.setDescription(`\`\`\`${error.toString().slice(0, 2000)}\`\`\``)
					.setColor('B80600')
					.setFooter({ text: `${errTime}` })];

				await interaction.client.channels.cache.get(process.env.ERROR_LOG_CHANNEL_ID).send({ embeds: errorEmbed });
			}
		}
	});
};
