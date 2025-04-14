import {ActionRowBuilder, MessageFlags, StringSelectMenuBuilder} from "discord.js";
import {parseFormattedNumber, translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const nickname = interaction.fields.getTextInputValue("bet_nickname");
    const betAmount = parseFormattedNumber(interaction.fields.getTextInputValue("bet_amount"));

    if (isNaN(betAmount)) {
        await interaction.reply({content: await translatedMessage(interaction, "errors.incorrectBetAmount"), flags: MessageFlags.Ephemeral});
        console.error("Update bet Incorrect amount:", betAmount );
        return ;
    }

    if (betAmount < 200) {
        return await interaction.reply({ content: await translatedMessage(interaction, "errors.betAmountTooLow"), flags: MessageFlags.Ephemeral });
    }

    const result = await pool.query("SELECT * FROM bet_events");
    const activeEvent = result.rows.find(_event => _event.end_time > new Date().getTime());

    if (!JSON.parse(activeEvent.participants).length) {
        await interaction.reply({ content: await translatedMessage(interaction, "errors.noBetParticipants"), flags: MessageFlags.Ephemeral });
        throw new Error("⚠ Ошибка: Не указаны участники для ставки");
    }

    const availableTargets = JSON.parse(activeEvent.participants).map(nick => ({
        label: nick,
        value: nick
    }));

    const targetSelect = new StringSelectMenuBuilder()
        .setCustomId(`bet_target_${nickname}_${betAmount}`)
        .setPlaceholder(await translatedMessage(interaction, "buttons.chooseBetTarget"))
        .addOptions(availableTargets);

    const row = new ActionRowBuilder().addComponents(targetSelect);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.selectTarget", {
            targets: JSON.parse(activeEvent.participants).join(", ")
        }),
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}