import {ButtonStyle, MessageFlags} from 'discord.js';
import {getActiveLotsCount} from "../../dbUtils.js";
import {createTradeMessage} from "./createMessage.js";

export default async function createLotHandler(interaction, pool, client) {
    const userId = interaction.user.id;

    // Проверяем количество активных лотов у пользователя
    const activeLots = await getActiveLotsCount(pool, userId);
    if (activeLots.rows[0].count >= 5) {
        return interaction.reply({ content: "🚫 У вас уже 5 активных лотов!", flags: MessageFlags.Ephemeral });
    }

    await createTradeMessage(interaction, pool, client);
    //
    // // Поиск продавца (WTS) с подходящим предметом
    // const match = await pool.query(`
    //     SELECT * FROM inventory
    //     WHERE type = 'WTS'
    //     AND item_offer = $1
    //     AND price <= $2
    //     AND server = $3
    //     AND user_id != $4
    //     ORDER BY price ASC, expires_at ASC
    //     LIMIT 1
    // `, [item, price, server, userId]);
    //
    // if (match.rows.length > 0) {
    //     const seller = match.rows[0];
    //
    //     const buyerUser = await interaction.client.users.fetch(userId);
    //     const sellerUser = await interaction.client.users.fetch(seller.user_id);
    //
    //     // Если торг запрещён, сразу отправляем контакты
    //     if (!negotiable) {
    //         await buyerUser.send(`💰 **Нашёлся продавец!** Вы можете купить **${item}** за **${seller.price}k** у <@${seller.user_id}>.`);
    //         await sellerUser.send(`🛒 **Нашёлся покупатель!** <@${userId}> хочет купить **${item}** за **${seller.price}k**.`);
    //
    //         return interaction.reply({ content: "✅ Найден продавец! Контакты отправлены.", flags: MessageFlags.Ephemeral });
    //     }
    //
    //     // Если торг разрешён, показываем покупателю модальное окно для ввода цены
    //     const row = new ActionRowBuilder().addComponents(
    //         new ButtonBuilder()
    //             .setCustomId(`make_offer_${seller.id}_${newLot.rows[0].id}`)
    //             .setLabel("💰 Предложить свою цену")
    //             .setStyle(ButtonStyle.Primary)
    //     );
    //
    //     await buyerUser.send({
    //         content: `📢 **Нашёлся продавец!** <@${seller.user_id}> продаёт **${item}** за **${seller.price}k**.\nВы можете **принять цену** или предложить **свою**.`,
    //         components: [row]
    //     });
    //
    //     await sellerUser.send(`🛒 **Нашёлся покупатель!** <@${userId}> хочет купить **${item}** за **${price}k**.`);
    //
    //     return interaction.reply({ content: "✅ Найден продавец! Ожидаем подтверждения.", flags: MessageFlags.Ephemeral });
    // }
    //
    // return interaction.reply({ content: "✅ Ваш запрос на покупку добавлен в систему.", flags: MessageFlags.Ephemeral });
}
