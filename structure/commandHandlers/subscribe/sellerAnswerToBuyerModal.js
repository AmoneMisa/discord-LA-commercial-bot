import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {getRaidName} from "../../dbUtils.js";

export default async function (interaction, pool, client) {
    try {
        const [, , buyerId, raidId] = interaction.customId.split('_');
        const buyer = await client.users.fetch(buyerId);
        const raidName = await getRaidName(pool, raidId);

        if (interaction.customId.startsWith('seller_answer_')) {
            const modal = new ModalBuilder()
                .setCustomId(`raid_buy_answer_${buyerId}_${raidId}`)
                .setTitle('Принятие запроса');

            const inputField = new TextInputBuilder()
                .setCustomId('lobby')
                .setLabel('Название лобби')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(inputField);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        } else {
            await buyer.send({content: `Продавец: <@${interaction.user.id}> отклонил ваш запрос на покупку рейда: ${raidName}`});
            await client.channels.fetch(interaction.message.channelId);
            await interaction.message.edit({
                content: '❌ Ваш отказ отправлен покупателю',
                components: [],
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (e) {
        console.error('Ошибка при отправке ответа покупателю', e);
    }
}