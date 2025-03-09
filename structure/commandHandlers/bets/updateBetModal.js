import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import i18n from "../../../locales/i18n.js";

export default async function (interaction) {
    const modal = new ModalBuilder()
        .setCustomId(`bet_update_modal`)
        .setTitle(i18n.t("buttons.updateBetTitle", { lng: interaction.client.language[interaction.user.id]}));

    const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel(i18n.t("buttons.updateBetAmountField", { lng: interaction.client.language[interaction.user.id]}))
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(i18n.t("buttons.updateBetAmountField", { lng: interaction.client.language[interaction.user.id]}))
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}