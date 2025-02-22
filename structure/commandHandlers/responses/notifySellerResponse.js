import {ButtonStyle, MessageFlags} from "discord.js";

/**
 * Handles an interaction to initiate a purchase request from a buyer to a seller in a raid scenario.
 *
 * @async
 * @function
 * @param {Interaction} interaction - The interaction object containing the user's request.
 * @param {Pool} pool - The database connection pool object used for any database operations (not used in this function).
 * @param {Client} client - The client instance of the bot used to fetch user information and send messages.
 * @description This function sends a message to the seller initiated by the buyer regarding a raid purchase request.
 *              If the buyer attempts to send the request to themselves, the interaction is terminated with a notice.
 *              The seller is notified and given five minutes to respond, after which the message is updated to indicate a timeout.
 * @throws This function logs errors to the console and notifies the user in case of an error during the interaction.
 */
export default async function (interaction, pool, client) {
    try {
        // отправка сообщения продавцу от покупателя
        const [, , , sellerId, buyerId] = interaction.customId.split('_');
        if (sellerId === buyerId) {
            await interaction.reply({
                content: "Вы не можете создать запрос на покупку самому себе",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const seller = await client.users.fetch(sellerId);

        await seller.send({
            content: `💰 **Запрос на покупку рейда!**
            **Покупатель:** <@${interaction.user.id}>
            **Персонаж:** ${interaction.fields.getTextInputValue('raid_buyer_nickname')}`, flags: MessageFlags.Ephemeral
        }).then((message) => {
            setTimeout(() => {
                message.edit({
                    content: `Время для ответа истекло`,
                    components: [],
                    flags: MessageFlags.Ephemeral
                });
            }, 1000 * 60 * 5);
        });

        await interaction.reply({
            content: '✅ Ваш запрос отправлен продавцу!',
            components: [],
            flags: MessageFlags.Ephemeral
        });
    } catch (error) {
        console.error('Ошибка при отправке уведомления продавцу:', error);
        await interaction.reply({content: '❌ Ошибка при отправке запроса продавцу.', flags: MessageFlags.Ephemeral});
    }
}