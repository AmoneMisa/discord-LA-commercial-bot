import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getRaidName} from "../../dbUtils.js";

/**
 * Notifies the seller about a raid purchase request by sending a message to the seller with the provided details.
 * Includes buttons for the seller to accept or reject the request. The response is time-limited, and the message
 * is updated if no response is received within the specified time.
 *
 * @async
 * @function notifySellerMessageSend
 * @param {Object} interaction - The interaction object representing the user's action.
 * @param {Object} pool - The database connection pool used to retrieve the raid name.
 * @param {Object} client - The client object used to fetch user and channel information and send messages.
 * @return {Promise<void>} Resolves successfully if the notification was sent or updated without errors; otherwise, logs the error and sends a failure reply.
 */
export default async function notifySellerMessageSend(interaction, pool, client) {
    try {
        const [, , sellerId, raidId] = interaction.customId.split('_');
        const seller = await client.users.fetch(sellerId);
        const raidName = await getRaidName(pool, raidId);

        if (seller) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`seller_answer_${interaction.user.id}_${raidId}`)
                        .setLabel('Принять')
                        .setStyle(ButtonStyle.Success)
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId(`seller_reject_${interaction.user.id}_${raidId}`)
                        .setLabel('Отклонить')
                        .setStyle(ButtonStyle.Danger)
                );

            seller.send({
                content: `💰 **Запрос на покупку рейда!**
            **Покупатель:** <@${interaction.user.id}>
            **Персонаж:** ${interaction.fields.getTextInputValue('buyer_nickname')}
            **Рейд:** ${raidName}`, components: [row], flags: MessageFlags.Ephemeral
            }).then((message) => {
                setTimeout(() => {
                    message.edit({
                        content: `Время для ответа истекло`,
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                }, 1000 * 60 * 5);
            });

            await client.channels.fetch(interaction.message.channelId);
            await interaction.message.edit({
                content: '✅ Ваш запрос отправлен продавцу!',
                components: [],
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (error) {
        console.error('Ошибка при отправке уведомления продавцу:', error);
        await interaction.reply({content: '❌ Ошибка при отправке запроса продавцу.', flags: MessageFlags.Ephemeral});
    }
}