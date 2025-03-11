import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function (interaction) {
    const modal = new ModalBuilder()
        .setCustomId(`bet_update_modal`)
        .setTitle(i18n.t("buttons.updateBetTitle", { lng: await getUserLanguage(interaction.user.id, pool)}));

    const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel(i18n.t("buttons.updateBetAmountField", { lng: await getUserLanguage(interaction.user.id, pool)}))
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(i18n.t("buttons.updateBetAmountField", { lng: await getUserLanguage(interaction.user.id, pool)}))
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}