import { MessageFlags } from 'discord.js';

/**
 * Unblocks a user, allowing them to receive feedback again.
 *
 * @param {Object} interaction - The interaction object containing user information and methods to handle replies.
 * @param {Object} pool - The database connection pool used for executing the unblock query.
 * @return {Promise<void>} Resolves when the user is successfully unblocked and a reply is sent.
 */
export default async function unblockReceiver(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM blocked_receivers WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: `✅ **${user.username}** теперь может получать отзывы.`,
        flags: MessageFlags.Ephemeral
    });
}
