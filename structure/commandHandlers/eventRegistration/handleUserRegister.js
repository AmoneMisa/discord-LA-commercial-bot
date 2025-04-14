import showRegistrationModal from "./showRegistrationModal.js";
import {MessageFlags} from "discord.js";

export default async function (interaction) {
    const eventId = interaction.customId.split("_")[2];

    // Проверяем, зарегистрирован ли уже пользователь
    const existingRegistration = await pool.query(
        "SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2",
        [eventId, interaction.user.id]
    );

    if (existingRegistration.rowCount > 0) {
        return interaction.reply({ content: "⚠️ Вы уже зарегистрированы!", flags: MessageFlags.Ephemeral });
    }

    await showRegistrationModal(interaction);
}