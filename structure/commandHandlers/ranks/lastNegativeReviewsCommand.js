import {sendPaginatedReviews} from "../../utils.js";
import {MessageFlags} from "discord.js";

/**
 * Handles the command to fetch and display the last negative reviews for a specific user.
 *
 * @param {Object} interaction - The interaction object that triggered the command.
 * @param {Object} pool - The database connection pool used for querying review data.
 * @return {Promise<void>} Resolves when the reviews have been retrieved and displayed or an error message is sent.
 */
export default async function handleLastNegativeReviewsCommand(interaction, pool) {
    const member = interaction.options.getUser('member');
    if (!member) return interaction.reply({ content: 'Выберите участника.', flags: MessageFlags.Ephemeral });

    await sendPaginatedReviews(interaction, pool, 1, false, member.id);
}