import {MessageFlags} from "discord.js";

/**
 * Deletes a betting event from the database based on the provided event ID.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing the user command and options.
 * @param {Object} pool - The database connection pool for executing queries.
 * @returns {Promise<void>} Resolves after responding to the interaction with the success or failure message.
 *
 * @throws {Error} Throws an error if the database query fails.
 *
 * Behaviour:
 * - Extracts the event ID from the interaction options.
 * - Executes a database query to delete the event with the matching ID.
 * - If no event is found with the given ID, replies with an error message to the user.
 * - If the event is successfully deleted, replies with a confirmation message to the user.
 */
export default async function (interaction, pool) {
    const eventId = interaction.options.getInteger("event_id");

    const result = await pool.query(`DELETE FROM bet_events WHERE id = $1 RETURNING *`, [eventId]);

    if (result.rowCount === 0) {
        return interaction.reply({ content: "🚫 Событие не найдено или уже удалено.", flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({ content: `✅ Событие ставок **#${eventId}** удалено!`, flags: MessageFlags.Ephemeral });
}
