import {sendPaginatedReviews} from "../../utils.js";
import {MessageFlags} from "discord.js";

/**
 * Handles an interaction to fetch and display paginated reviews for a specified member.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object received from the Discord API.
 * @param {Object} pool - The database connection pool.
 * @returns {Promise<void>} Resolves when the interaction is processed and the appropriate reply is sent.
 *
 * @throws {Error} If an error occurs during the database query execution or reply processing.
 */
export default async function (interaction, pool) {
    const member = interaction.options.getUser('member');
    if (!member) return interaction.reply({content: 'Выберите участника.', flags: MessageFlags.Ephemeral});

    await sendPaginatedReviews(interaction, pool,1, true, member.id);
}