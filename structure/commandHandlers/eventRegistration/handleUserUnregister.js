import {MessageFlags} from "discord.js";

export default async function (interaction) {
    const eventId = interaction.options.getInteger("event_id");
    const userId = interaction.user.id;

    const deleteResult = await pool.query(
        "DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2 RETURNING *",
        [eventId, userId]
    );

    if (deleteResult.rowCount === 0) {
        return interaction.reply({ content: "⚠️ Вы не зарегистрированы на этот ивент!", flags: MessageFlags.Ephemeral });
    }

    return interaction.reply({ content: "✅ Ваша регистрация отменена.", flags: MessageFlags.Ephemeral });
}
