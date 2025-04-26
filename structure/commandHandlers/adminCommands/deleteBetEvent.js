import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Deletes a betting event from the database based on the provided event ID.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing the user command and options.
 * @returns {Promise<void>} Resolves after responding to the interaction with the success or failure message.
 */
export default async function (interaction) {
    const eventId = interaction.options.getInteger("event_id");

    const result = await pool.query(
        `DELETE FROM bet_events WHERE id = $1 RETURNING *`,
        [eventId]
    );

    if (result.rowCount === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.eventNotFound"),
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.reply({
        content: await translatedMessage(interaction, "info.betEventDeleted", { eventId }),
        flags: MessageFlags.Ephemeral
    });
}
