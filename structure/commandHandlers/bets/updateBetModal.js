import {ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {getActiveEvent, translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const event = await getActiveEvent();
    if (!event) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.noBetEventExist"),
            flags: MessageFlags.Ephemeral
        });
    }
    const bet = await pool.query(`SELECT *
                                  FROM bets
                                  WHERE event_id = $1
                                    AND user_id = $2`, [event.id, interaction.user.id]);
    if (!bet.rows.length) {
        await interaction.reply({
            content: await translatedMessage(interaction, "errors.betDontExist"),
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId(`bet_update_modal_${interaction.user.id}`)
        .setTitle(await translatedMessage(interaction, "buttons.updateBetTitle"));

    const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel(   await translatedMessage(interaction, "buttons.updateBetAmountField"))
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(   await translatedMessage(interaction, "buttons.updateBetAmountField"))
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}