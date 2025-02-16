import {ButtonStyle, MessageFlags} from 'discord.js';
import {sendPaginatedList} from "../../utils.js";

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
