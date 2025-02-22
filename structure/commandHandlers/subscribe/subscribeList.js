import {ButtonStyle, MessageFlags} from 'discord.js';
import {sendPaginatedList} from "../../utils.js";

/**
 * Retrieves a list of up to 5 unique sellers that the user has subscribed to, ordered by their rating in descending order.
 * If no subscriptions are found for the user, sends a reply indicating the absence of favorites.
 * Otherwise, sends a paginated list of subscriptions.
 *
 * @param {Object} interaction - The interaction object representing the user's action.
 * @param {Object} pool - The database connection pool used for querying subscriptions and users.
 * @return {Promise<void>} A promise that resolves after the reply or paginated list is sent.
 */
export default async function subscribeList(interaction, pool) {
    const buyerId = interaction.user.id;
    const subscriptions = await pool.query(`
        SELECT
            DISTINCT ON (s.seller_id)
            s.seller_id,
            u.rating
        FROM subscriptions s
                 LEFT JOIN users u ON s.seller_id = u.user_id
        WHERE s.buyer_id = $1
        ORDER BY s.seller_id, u.rating DESC
        LIMIT 5;
    `, [buyerId]);

    if (subscriptions.rows.length === 0) {
        return interaction.reply({
            content: '🚫 У вас пока нет фаворитов!',
            flags: MessageFlags.Ephemeral
        });
    }

    await sendPaginatedList(interaction, subscriptions.rows, pool);
}
