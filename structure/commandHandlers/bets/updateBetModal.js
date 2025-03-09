import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default async function (interaction) {
    const modal = new ModalBuilder()
        .setCustomId(`bet_update_modal`)
        .setTitle('Увеличить ставку');

    const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel('Введите НОВОЕ значение ставки')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Введите НОВОЕ значение ставки')
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}