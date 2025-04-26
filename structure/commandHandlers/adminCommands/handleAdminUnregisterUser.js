import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const eventId = interaction.options.getInteger("event_id");
    const userId = interaction.options.getUser("user").id;

    const deleteResult = await pool.query(
        "DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2 RETURNING *",
        [eventId, userId]
    );

    if (deleteResult.rowCount === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.userNotRegistered"),
            flags: MessageFlags.Ephemeral
        });
    }

    return interaction.reply({
        content: await translatedMessage(interaction, "info.userRegistrationDeleted", {userId}),
        flags: MessageFlags.Ephemeral
    });
}