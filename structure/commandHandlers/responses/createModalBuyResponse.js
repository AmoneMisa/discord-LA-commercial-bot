import {MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} from 'discord.js';

export default async function (interaction) {
    // создание модалки на покупку рейда
    const [, , , sellerId] = interaction.customId.split('_');

    const modal = new ModalBuilder()
        .setCustomId(`response_raid_buy_${sellerId}_${interaction.user.id}`)
        .setTitle('Покупка рейда');

    const inputField = new TextInputBuilder()
        .setCustomId('raid_buyer_nickname')
        .setLabel('Ваш ник')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(20)
        .setMinLength(8)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(inputField);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}
