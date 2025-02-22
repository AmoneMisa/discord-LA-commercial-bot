import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";

/**
 * Sends a response to a raid-related message by adding action buttons for users to interact with.
 *
 * @param {Object} message - The message object to which the response will be sent.
 * It contains metadata about the message, including the author and channel.
 * @param {Object} pool - The database connection pool used to query settings information.
 * It is required to fetch configuration values related to the handling of the message.
 * @return {Promise<void>} Resolves when the message has been successfully processed and the response sent.
 * If conditions are not met for sending the response, the function resolves immediately without sending anything.
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
            .setCustomId(`join_raid_${sellerId}`)
            .setLabel('Хочу в рейд')
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
}
