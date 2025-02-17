import { MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default async function handleBuyButtons(interaction) {
    const [ , , sellerId, raidId] = interaction.customId.split('_');

    const modal = new ModalBuilder()
        .setCustomId(`raid_buy_${sellerId}_${raidId}`)
        .setTitle('Покупка рейда');

    const inputField = new TextInputBuilder()
        .setCustomId('buyer_nickname')
        .setLabel('Ваш ник(-и)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(inputField);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}
