import {ActionRowBuilder, MessageFlags, StringSelectMenuBuilder} from "discord.js";
import {parseFormattedNumber} from "../../utils.js";

export default async function (interaction, pool) {
    const nickname = interaction.fields.getTextInputValue("bet_nickname");
    const betAmount = parseFormattedNumber(interaction.fields.getTextInputValue("bet_amount"));
    const server = interaction.fields.getTextInputValue("bet_server");

    if (isNaN(betAmount)) {
        await interaction.reply({content: "Введённое вами число содержит недопустимые символы или формат ввода.", flags: MessageFlags.Ephemeral});
        console.error("Update bet Incorrect amount:", betAmount );
        return ;
    }

    if (server.toLowerCase() !== 'кратос' && server.toLowerCase() !== 'альдеран') {
        await interaction.reply({content: "Введённый вами сервер не соответствует названию Кратос или Альдеран.", flags: MessageFlags.Ephemeral});
        console.error("Некорректное название сервера:", server );
        return ;
    }

    if (betAmount < 200) {
        return await interaction.reply({ content: "⚠ Ошибка: Ставка должна быть от 200", flags: MessageFlags.Ephemeral });
    }

    const result = await pool.query("SELECT * FROM bet_events");
    const activeEvent = result.rows.find(_event => _event.end_time > new Date().getTime());

    if (!JSON.parse(activeEvent.participants).length) {
        await interaction.reply({ content: "Что-то пошло не так, пожалуйста, обратитесь к администрации", flags: MessageFlags.Ephemeral });
        throw new Error("⚠ Ошибка: Не указаны участники для ставки");
    }

    const availableTargets = JSON.parse(activeEvent.participants).map(nick => ({
        label: nick,
        value: nick
    }));

    const targetSelect = new StringSelectMenuBuilder()
        .setCustomId(`bet_target_${nickname}_${betAmount}_${server}`)
        .setPlaceholder("Выберите, на кого поставить")
        .addOptions(availableTargets);

    const row = new ActionRowBuilder().addComponents(targetSelect);

    await interaction.reply({
        content: `✅ Выберите, на кого поставить:\n📌 **Доступные цели:** ${JSON.parse(activeEvent.participants).join(", ")}`,
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}