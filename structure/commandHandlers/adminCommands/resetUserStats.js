import { MessageFlags } from 'discord.js';

/**
 * Resets the statistics for a specified user by updating their rating, positive reviews,
 * and negative reviews to zero in the database.
 *
 * @param {Object} interaction - The interaction object containing information about the user
 *                                and triggering event.
 * @param {Object} pool - The database connection pool used for executing the update query.
 * @return {Promise<void>} A promise that resolves when the user's statistics have been successfully reset
 *                         and the interaction reply has been sent.
 */
export default async function resetUserStats(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('UPDATE users SET rating = 0, positive_reviews = 0, negative_reviews = 0 WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: `🔄 Статистика пользователя **${user.username}** сброшена.`,
        flags: MessageFlags.Ephemeral
    });
}
