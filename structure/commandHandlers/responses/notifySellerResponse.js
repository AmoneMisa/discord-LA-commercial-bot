import {ButtonStyle, MessageFlags} from "discord.js";

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