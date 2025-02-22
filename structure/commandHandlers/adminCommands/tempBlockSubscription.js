import {MessageFlags} from "discord.js";

/**
 * Temporarily blocks a user from subscriptions for a specified number of hours.
 *
 * @param {object} interaction - The interaction object containing the user and hours information.
 * @param {object} pool - The database connection pool to execute the query.
 * @return {Promise<void>} Resolves when the user has been blocked and a reply is sent to the interaction.
 */
export default async function tempBlockSubscription(interaction, pool) {
    const userId = interaction.options.getUser('user').id;
    const hours = interaction.options.getInteger('hours');

    await pool.query('INSERT INTO temp_blocked_subscriptions (user_id, expires_at) VALUES ($1, NOW() + INTERVAL \'$2 hours\') ON CONFLICT (user_id) DO UPDATE SET expires_at = NOW() + INTERVAL \'$2 hours\'', [userId, hours]);

    await interaction.reply({ content: `🚫 Пользователь заблокирован для подписок на ${hours} часов.`, flags: MessageFlags.Ephemeral });
}
