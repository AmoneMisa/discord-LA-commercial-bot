import {ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle} from "discord.js";
import {getMarketLot} from "../../utils.js";

export default async function (interaction, lotId) {
    const lot = await getMarketLot(lotId);
    console.log("lot", lot)
    const modal = new ModalBuilder()
        .setCustomId(`buy_lot_modal_${lotId}`)
        .setTitle("🛒 Покупка лота");

    const amountInput = new TextInputBuilder()
        .setCustomId("buy_amount")
        .setLabel("Введите количество золота")
        .setStyle(TextInputStyle.Short)
        .setValue(lot.min_order)
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
