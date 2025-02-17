import {MessageFlags} from "discord.js";

export default async function wtsHandler(interaction, pool) {
    const userId = interaction.user.id;
    const [item, price, negotiable, server, amount] = [
        interaction.options.getString('offer_item'),
        interaction.options.getInteger('offer_price'),
        interaction.options.getBoolean('negotiable'),
        interaction.options.getString('server'),
        interaction.options.getInteger('offer_amount')
    ];

    if (amount < 1 || amount > 9999) {
        return interaction.reply({ content: "❌ Количество должно быть от 1 до 9999!", flags: MessageFlags.Ephemeral });
    }

    await pool.query(`
        INSERT INTO inventory (user_id, type, item_offer, price, negotiable, server, amount, expires_at)
        VALUES ($1, 'WTS', $2, $3, $4, $5, $6, NOW() + INTERVAL '3 days')
    `, [userId, item, price, negotiable, server, amount]);

    // Поиск покупателей
    const match = await pool.query(`
        SELECT * FROM inventory 
        WHERE type = 'WTB' 
        AND item_request = $1 
        AND price >= $2 
        AND server = $3 
        AND user_id != $4
    `, [item, price, server, userId]);

    if (match.rows.length > 0) {
        const buyer = match.rows[0].user_id;
        if (!negotiable) {
            await sendTradeNotification(userId, buyer, "покупка без торга");
        } else {
            await requestPriceNegotiation(userId, buyer, item);
        }
    }

    return interaction.reply({ content: "✅ Ваш лот добавлен!", flags: MessageFlags.Ephemeral });
}
