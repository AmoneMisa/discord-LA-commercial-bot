import {sendPaginatedReviews} from "../../utils.js";
import {MessageFlags} from "discord.js";

/**
 * Handles the "last reviews" command by displaying paginated reviews for a specified member.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} pool - Database connection pool used to fetch the reviews data.
 * @return {Promise<void>} Resolves when the operation is complete or sends a response if no member is provided.
 */
export default async function handleLastReviewsCommand(interaction, pool) {
    const member = interaction.options.getUser('member');
    if (!member) return interaction.reply({ content: 'Выберите участника.', flags: MessageFlags.Ephemeral });

    await sendPaginatedReviews(interaction, pool,1, null, member.id);
}