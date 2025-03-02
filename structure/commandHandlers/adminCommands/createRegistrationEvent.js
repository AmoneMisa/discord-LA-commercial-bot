import {ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags} from "discord.js";

export default async function (interaction, pool) {
    const messageId = interaction.options.getString("message_id");
    const startTime = interaction.options.getString("start_time");
    const endTime = interaction.options.getString("end_time");

    // Записываем ивент в базу данных
    const insertEvent = await pool.query(
        "INSERT INTO events (message_id, start_time, end_time, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
        [messageId, startTime, endTime, interaction.user.id]
    );

    const eventId = insertEvent.rows[0].id;

    // Добавляем кнопку под сообщением
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`register_event_${eventId}`)
            .setLabel("🎟️ Записаться")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`register_event_${eventId}`)
            .setLabel("🎟️ Отменить запись")
            .setStyle(ButtonStyle.Danger)
    );

    const targetMessage = await interaction.channel.messages.fetch(messageId);
    await targetMessage.edit({ components: [row] });

    await interaction.reply({ content: "✅ Ивент создан! Кнопка добавлена.", flags: MessageFlags.Ephemeral });
}