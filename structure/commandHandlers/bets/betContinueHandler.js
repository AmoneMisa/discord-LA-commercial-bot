import {ActionRowBuilder, MessageFlags, StringSelectMenuBuilder} from "discord.js";

export default async function (interaction, pool) {
    const nickname = interaction.fields.getTextInputValue("bet_nickname");
    const betAmount = parseInt(interaction.fields.getTextInputValue("bet_amount"), 10);
    const server = interaction.fields.getTextInputValue("bet_server");

    if (isNaN(betAmount) || betAmount < 1 || betAmount > 2000) {
        return await interaction.reply({ content: "⚠ Ошибка: Ставка должна быть от 1 до 2000.", flags: MessageFlags.Ephemeral });
    }

    const result = await pool.query("SELECT * FROM bet_events");
    const activeEvent = result.rows.find(_event => _event.end_time > new Date().getTime());

    if (!convertParticipantsToArray(activeEvent.participants).length) {
        return await interaction.reply({ content: "⚠ Ошибка: Не указаны участники для ставки", flags: MessageFlags.Ephemeral });
    }

    const availableTargets = convertParticipantsToArray(activeEvent.participants).map(nick => ({
        label: nick,
        value: nick
    }));

    const targetSelect = new StringSelectMenuBuilder()
        .setCustomId(`bet_target_${nickname}_${betAmount}_${server}`)
        .setPlaceholder("Выберите, на кого поставить")
        .addOptions(availableTargets);

    const row = new ActionRowBuilder().addComponents(targetSelect);

    await interaction.reply({
        content: `✅ Выберите, на кого поставить:\n📌 **Доступные цели:** ${convertParticipantsToArray(activeEvent.participants).join(", ")}`,
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}

function convertParticipantsToArray(participants) {
    return participants.replace(/^\{|}$/g, "").split('","').map(s => s.replace(/^"|"$/g, ''));
}