import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";
import {getActiveEvent} from "../../utils.js";

export default async function (interaction, pool) {
    const lang = await getUserLanguage(interaction.user.id, pool);

    const event = await getActiveEvent(pool);
    if (!event) {
        return await interaction.reply({
            content: i18n.t("errors.noBetEventExist", { lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }
    const bet = await pool.query(`SELECT *
                                  FROM bets
                                  WHERE event_id = $1
                                    AND user_id = $2`, [event.id, interaction.user.id]);
    if (!bet.rows.length) {
        await interaction.reply({
            content: i18n.t("errors.betDontExist", { lng: lang}),
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId(`bet_update_modal_${interaction.user.id}`)
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