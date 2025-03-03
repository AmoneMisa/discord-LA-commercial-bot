import {shuffleArray} from "../../utils.js";

/**
 * Asynchronously selects a specified number of non-bot members from the recent messages in a channel.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object representing the command interaction.
 * @param {Object} interaction.channel - The channel from which to fetch messages.
 * @param {Object} interaction.options - The options provided with the interaction command.
 * @param {function} interaction.options.getInteger - Retrieves an integer from the interaction options by key.
 *
 * @returns {Promise<void>} Resolves when the reply is sent. Responds to the interaction with a list of selected members
 *                          or a warning message if the available number of members is less than requested.
 */
export default async function (interaction) {
    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 100 });
    const amount = interaction.options.getInteger("amount");
    const membersSet = new Set();

    messages.forEach(msg => {
        if (!msg.author.bot) {
            membersSet.add(msg.author.id);
        }
    });

    const membersArray = Array.from(membersSet).map(id => channel.guild.members.cache.get(id)).filter(Boolean);

    if (membersArray.length < amount) {
        return interaction.reply({ content: `⚠️ Недостаточно участников (${membersArray.length} доступно).`, flags: MessageFlags.Ephemeral });
    }

    const chosen = shuffleArray(membersArray).slice(0, amount);

    interaction.reply(`🎉 **Выбранные участники:** ${chosen.join(", ")}`);
}