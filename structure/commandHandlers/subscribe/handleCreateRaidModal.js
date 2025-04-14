import {MessageFlags} from "discord.js";
import editRaids from "../adminCommands/editRaids.js";

/**
 * Handles the creation of a new raid based on user input, updates the database with the new raid,
 * sends a confirmation message to the user, and updates the raid list view.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing user input and methods for replying.
 * @throws Will throw an error if the database query fails or if there are issues in subsequent operations.
 */
export default async function(interaction) {
    const raidName = interaction.fields.getTextInputValue('raid_name');

    await pool.query('INSERT INTO raids (raid_name) VALUES ($1)', [raidName]);

    await interaction.reply({
        content: `✅ Рейд **"${raidName}"** успешно создан!`,
        flags: MessageFlags.Ephemeral
    });

    await editRaids(interaction);
}