import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function (interaction, pool) {
    const lang = await getUserLanguage(interaction.user.id, pool);
    const modal = new ModalBuilder()
        .setCustomId(`bet_update_modal`)
        .setTitle(i18n.t("buttons.updateBetTitle", { lng: lang}));

    const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel(i18n.t("buttons.updateBetAmountField", { lng: lang}))
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(i18n.t("buttons.updateBetAmountField", { lng: lang}))
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}