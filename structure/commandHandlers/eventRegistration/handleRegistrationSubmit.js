import {EmbedBuilder, MessageFlags} from "discord.js";

/**
 * Handles the registration submission for an event.
 *
 * @param {Object} interaction - The interaction object representing the user action.
 * @param {Object} pool - The database connection pool to query and update data.
 * @return {Promise<void>} A promise that resolves when the registration process is complete.
 */
export default async function (interaction, pool) {
    const eventId = interaction.customId.split("_")[2];

    await pool.query(
        "INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2)",
        [eventId, interaction.user.id]
    );

    return interaction.reply({ content: "✅ Вы успешно зарегистрировались!", ephemeral: true });
}