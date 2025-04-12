import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";

export default async function (interaction, lotId) {
    const modal = new ModalBuilder()
        .setCustomId(`buy_lot_modal_${lotId}`)
        .setTitle("🛒 Покупка лота");

    const amountInput = new TextInputBuilder()
        .setCustomId("buy_amount")
        .setLabel("Введите количество золота")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const commentInput = new TextInputBuilder()
        .setCustomId("buy_comment")
        .setLabel("Комментарий (необязательно)")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(amountInput),
        new ActionRowBuilder().addComponents(commentInput)
    );

    await interaction.showModal(modal);
}
