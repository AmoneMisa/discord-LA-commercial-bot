import {shuffleArray} from "../../utils.js";

/**
 * Handles an interaction by retrieving a specified message, filtering mentioned members, and selecting a randomized subset up to the specified amount.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object from the Discord API.
 * @param {Object} interaction.options - Object containing command options.
 * @param {string} interaction.options.getString - Method to fetch the string argument for "message_id".
 * @param {number} interaction.options.getInteger - Method to fetch the integer argument for "amount".
 * @param {Object} interaction.channel - The channel in which the interaction occurred.
 *
 * @returns {Promise<void>} Resolves to no value but replies to the interaction with the result.
 *
 * The method retrieves a message in the current channel using the provided "message_id".
 * If the message is not found, the interaction is replied to with an error message.
 * Fetches user mentions from the message, filtering out bots.
 * Checks if the number of filtered members matches the required amount; otherwise, it sends a warning.
 * Selects a randomized subset of mentioned members if the required amount is available.
 * Replies to the interaction with the list of chosen members.
 */
export default async function (interaction) {
    const messageId = interaction.options.getString("message_id");
    const channel = interaction.channel;
    const amount = interaction.options.getInteger("amount");
    const message = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
        return interaction.reply({ content: "❌ Сообщение не найдено!", ephemeral: true });
    }

    const mentions = message.mentions.members.filter(member => !member.user.bot);

    if (mentions.size < amount) {
        return interaction.reply({ content: `⚠️ Недостаточно упомянутых участников (${mentions.size} доступно).`, ephemeral: true });
    }

    const chosen = shuffleArray(Array.from(mentions.values())).slice(0, amount);

    interaction.reply(`🎉 **Выбранные участники из упоминаний:** ${chosen.join(", ")}`);
}