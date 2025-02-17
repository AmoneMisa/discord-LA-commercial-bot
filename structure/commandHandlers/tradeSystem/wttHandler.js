import {MessageFlags} from "discord.js";

export default async function wttHandler(interaction, pool) {
    const userId = interaction.user.id;
    const [itemOffer, itemRequest, amountOffer, amountRequest, levelOffer, levelRequest, server] = [
        interaction.options.getString('offer_item'),
        interaction.options.getString('request_item'),
        interaction.options.getInteger('offer_amount'),
        interaction.options.getInteger('request_amount'),
        interaction.options.getInteger('offer_level'),
        interaction.options.getInteger('request_level'),
        interaction.options.getString('server')
    ];

    // Проверяем, есть ли у пользователя свободный слот
    const activeLots = await pool.query("SELECT COUNT(*) FROM inventory WHERE user_id = $1", [userId]);
    if (activeLots.rows[0].count >= 5) {
        return interaction.reply({ content: "🚫 У вас уже 5 активных лотов!", flags: MessageFlags.Ephemeral });
    }

    // Добавляем в базу
    await pool.query(`
        INSERT INTO inventory (user_id, type, item_offer, item_request, amount_offer, amount_request, offer_level, request_level, server, expires_at)
        VALUES ($1, 'WTT', $2, $3, $4, $5, $6, $7, $8, NOW() + INTERVAL '3 days')
    `, [userId, itemOffer, itemRequest, amountOffer, amountRequest, levelOffer, levelRequest, server]);

    // Поиск подходящего предложения
    const match = await pool.query(`
        SELECT * FROM inventory 
        WHERE type = 'WTT' 
        AND item_offer = $1 
        AND item_request = $2 
        AND amount_offer = $3
        AND amount_request = $4  
        AND offer_level = $5
        AND request_level = $6 
        AND server = $7
        AND user_id != $8
    `, [itemRequest, itemOffer, amountOffer, amountRequest, levelOffer, levelRequest, server, userId]);

    if (match.rows.length > 0) {
        const matchedUser = match.rows[0].user_id;
        await sendTradeNotification(userId, matchedUser, "обмен");
    }

    return interaction.reply({ content: "✅ Ваш лот добавлен в систему!", flags: MessageFlags.Ephemeral});
}
