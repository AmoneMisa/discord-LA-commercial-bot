import { MessageFlags } from 'discord.js';

/**
 * Unblocks a reviewer by deleting their entry from the "blocked_reviewers" table
 * in the database and notifies the user about the action.
 *
 * @param {object} interaction - The interaction object representing the user's command.
 * @param {object} pool - The database connection pool used to execute the query.
 * @return {Promise<void>} Resolves when the reviewer has been successfully unblocked
 * and the confirmation message is sent.
 */
export default async function unblockReviewer(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM blocked_reviewers WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: `✅ **${user.username}** теперь может оставлять отзывы.`,
        flags: MessageFlags.Ephemeral
    });
}
