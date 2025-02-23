import {MessageFlags} from "discord.js";

/**
 * Blocks a user's subscription by adding their user ID to the blocked subscriptions list.
 *
 * @param {Object} interaction - The interaction object from the command, containing the user to block and other related data.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @return {Promise<void>} Resolves after the user's subscription block is successfully added and a response is sent to the interaction.
 */
export default async function blockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    const blockType = interaction.options.getString('block_type');

    await pool.query('INSERT INTO blocked_subscriptions (user_id, block_type) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, blockType]);
    await interaction.reply({ content: `🚫 Пользователю запрещено подписываться.`, flags: MessageFlags.Ephemeral });
}
