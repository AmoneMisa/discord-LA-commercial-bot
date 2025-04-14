import {MessageFlags} from "discord.js";
import {getActiveEvent, parseDateToTimestamp, translatedMessage} from "../../utils.js";

/**
 * Creates a new bet event and saves it in the database, then sends a reply to the interaction.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} interaction.options - The options object containing command parameters.
 * @param {string} interaction.options.getString - A method to retrieve string options from the interaction.
 * @return {Promise<void>} A promise that resolves once the bet event is created and a response is sent.
 */
export default async function (interaction) {
    const isEventExist = await getActiveEvent(true);

    if (isEventExist) {
        await interaction.reply({
            content: await translatedMessage(interaction, "errors.eventAlreadyExists"),
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const startTime = interaction.options.getString('start_time');
    const endTime = interaction.options.getString('end_time');
    const participantsRaw = interaction.options.getString("participants");

    let participants = participantsRaw.split(",").map(nick => nick.trim());
    participants = [...new Set(participants)];

    if (participants.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.emptyParticipantsList"),
            flags: MessageFlags.Ephemeral
        });
    }
    await pool.query(
        `INSERT INTO bet_events (name, description, start_time, end_time, participants)
         VALUES ($1, $2, to_timestamp($3), to_timestamp($4), $5)`,
        [name, description, parseDateToTimestamp(startTime) / 1000, parseDateToTimestamp(endTime) / 1000, JSON.stringify(participants)]
    );

    await interaction.reply({
        content: await translatedMessage(interaction, "info.betEventCreated", {
            name,
            description,
            startTime,
            endTime,
            participants: participants.join(", ")
        }),
        flags: MessageFlags.Ephemeral
    });
}
