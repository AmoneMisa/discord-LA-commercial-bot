import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getRaidName} from "../../dbUtils.js";

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