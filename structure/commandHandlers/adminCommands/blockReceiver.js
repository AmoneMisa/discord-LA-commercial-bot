import {MessageFlags} from 'discord.js';

/**
 * Blocks a user from receiving feedback by adding their user ID to the blocked_receivers database.
 *
 * @param {Object} interaction - The interaction object from the command, containing user and context data.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} Resolves after the user is successfully blocked and a response is sent.
 */
export default async function blockReceiver(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('INSERT INTO blocked_receivers (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    await interaction.reply({
        content: `🚫 **${user.username}** теперь не может получать отзывы.`,
        flags: MessageFlags.Ephemeral
    });
}
