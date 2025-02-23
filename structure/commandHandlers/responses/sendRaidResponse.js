import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {givePointsForActivity} from "../../dbUtils.js";

/**
 * Sends a response message with interactive buttons in a specific channel category
 * if the conditions are met, such as message age and channel category.
 * It also awards points to the message author for activity.
 *
 * @param {import('discord.js').Message} message - The Discord message object where the response will be sent.
 * @param {import('pg').Pool} pool - The PostgreSQL connection pool used for querying and updating data.
 * @return {Promise<void>} Resolves when the response message is sent and points are awarded.
 */
export default async function sendRaidResponse(message, pool) {
    // отправка сообщения с кнопками
    if (message.author.bot) {
        return;
    }

    const categoryResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['bus_category']);

    if (categoryResult.rowCount === 0) {
        return;
    }

    const categoryId = categoryResult.rows[0].value;

    if (message.channel.parentId !== categoryId) {
        return;
    }

    const messageAge = Date.now() - message.createdTimestamp;
    if (messageAge > 60 * 1000) {
        return; // Если сообщение старше 1 минуты, не отвечаем
    }

    const sellerId = message.author.id;

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`join_raid_${sellerId}_dd`)
            .setLabel('+dd')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`join_raid_${sellerId}_sup`)
            .setLabel('+sup')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`response_raid_buy_${sellerId}`)
            .setLabel('Хочу купить')
            .setStyle(ButtonStyle.Primary)
    );

    await message.reply({
        content: `✅ **Выберите действие:**`,
        components: [row],
        flags: MessageFlags.SuppressNotifications
    });

    await givePointsForActivity(pool, message.author.id, 5);
}
