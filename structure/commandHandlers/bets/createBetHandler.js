import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

export default async function (interaction, pool) {
    const event = await pool.query("SELECT * FROM bet_events WHERE end_time > NOW()");
    if (event.rowCount === 0) {
        return interaction.reply({ content: "❌ Это событие либо не существует, либо уже завершилось.", ephemeral: true });
    }

    // Проверяем, настроен ли закрытый канал
    const settings = await pool.query("SELECT bet_info_private_channel_id FROM settings WHERE key = 'bet_info_private_channel_id'");
    const channelId = settings.rows[0].value;

    if (!channelId) {
        return await interaction.reply({ content: "⚠️ Канал для ставок не настроен администратором.", ephemeral: true });
    }

    const channel = await interaction.guild.channels.fetch(channelId);
    if (!channel) {
        return await interaction.reply({ content: "⚠️ Ошибка: не найден канал для ставок.", ephemeral: true });
    }

    const nicknameInput = new TextInputBuilder()
        .setCustomId("bet_nickname")
        .setLabel("Введите ваш ник")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const betAmountInput = new TextInputBuilder()
        .setCustomId("bet_amount")
        .setLabel("Введите сумму ставки (1 - 2000)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const serverSelect = new StringSelectMenuBuilder()
        .setCustomId("bet_server")
        .setPlaceholder("Выберите сервер")
        .addOptions([
            {label: "Кратос", value: "kratos"},
            {label: "Альдеран", value: "alderan"},
        ]);

    const continueButton = new ButtonBuilder()
        .setCustomId("bet_continue")
        .setLabel("Продолжить")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const row1 = new ActionRowBuilder().addComponents(nicknameInput);
    const row2 = new ActionRowBuilder().addComponents(betAmountInput);
    const row3 = new ActionRowBuilder().addComponents(serverSelect);
    const row4 = new ActionRowBuilder().addComponents(continueButton);

    await interaction.reply({
        content: "🎲 **Создание ставки**\nЗаполните информацию ниже и нажмите **'Продолжить'**",
        components: [row1, row2, row3, row4],
        ephemeral: true
    });
}