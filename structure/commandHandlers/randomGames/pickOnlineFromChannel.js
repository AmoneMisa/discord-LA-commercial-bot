import {shuffleArray} from "../../utils.js";

/**
 * Handles an interaction to select a specific number of online members from a channel's recent messages.
 *
 * Retrieves the last 100 messages from the interaction's channel and filters out unique, non-bot authors.
 * Determines which authors are currently online and selects a specified number of them at random.
 * Sends a reply with the selected online members or an error message if the required number of online members is unavailable.
 *
 * @param {Object} interaction - The interaction object containing channel, options, and reply methods.
 * @param {Object} interaction.channel - The channel from which messages are collected.
 * @param {Function} interaction.options.getInteger - Retrieves the specified integer parameter from interaction options.
 * @param {Function} interaction.reply - Sends a reply to the interaction.
 *
 * @returns {Promise<void>} Sends a reply with the results of the selection process.
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

    const membersArray = Array.from(membersSet)
        .map(id => channel.guild.members.cache.get(id))
        .filter(member => member && member.presence?.status === "online");

    if (membersArray.length < amount) {
        return interaction.reply({ content: `⚠️ Недостаточно онлайн участников (${membersArray.length} доступно).`, flags: MessageFlags.Ephemeral });
    }

    const chosen = shuffleArray(membersArray).slice(0, amount);

    interaction.reply(`🎉 **Выбранные онлайн участники:** ${chosen.join(", ")}`);
}