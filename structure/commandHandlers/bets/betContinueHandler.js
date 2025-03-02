import {ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";

export default async function (interaction, pool) {
    const nickname = interaction.message.components[0].components[0].value;
    const betAmount = parseInt(interaction.message.components[1].components[0].value, 10);
    const server = interaction.message.components[2].components[0].value;

    if (isNaN(betAmount) || betAmount < 1 || betAmount > 2000) {
        return await interaction.reply({ content: "⚠ Ошибка: Ставка должна быть от 1 до 2000.", ephemeral: true });
    }

    const participants = await pool.query();
    if (participants.length === 0) {
        return await interaction.reply({ content: "⚠ Нет доступных целей для ставки.", ephemeral: true });
    }

    const result = await pool.query("SELECT * FROM bets_events");
    const activeEvent = result.rows.find(_event => _event.end_time > new Date().getTime());

    const availableTargets = activeEvent.participants.map(nick => ({
        label: nick,
        value: nick
    }));

    const targetSelect = new StringSelectMenuBuilder()
        .setCustomId("bet_target")
        .setPlaceholder("Выберите, на кого поставить")
        .addOptions(availableTargets);

    const row = new ActionRowBuilder().addComponents(targetSelect);

    await interaction.reply({
        content: `✅ Выберите, на кого поставить:\n📌 **Доступные цели:** ${activeEvent.participants.join(", ")}`,
        components: [row],
        ephemeral: true
    });

    await interaction.update({
        content: `✅ Вы выбрали ник: **${nickname}**, сервер: **${server}**, ставка: **${betAmount}**. Теперь выберите цель:`,
        components: [row],
        ephemeral: true
    });
}