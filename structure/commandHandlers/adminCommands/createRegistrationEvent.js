import {ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";

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
            .setLabel(i18n.t("buttons.registerEvent", { lng: interaction.client.language[interaction.user.id] }))
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`unregister_event_${eventId}`)
            .setLabel(i18n.t("buttons.unregisterEvent", { lng: interaction.client.language[interaction.user.id] }))
            .setStyle(ButtonStyle.Danger)
    );

    const targetMessage = await interaction.channel.messages.fetch(messageId);
    await targetMessage.edit({ components: [row] });

    await interaction.reply({ content: i18n.t("info.eventCreated", { lng: interaction.client.language[interaction.user.id] }), flags: MessageFlags.Ephemeral });
}