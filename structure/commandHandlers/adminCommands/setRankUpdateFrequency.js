import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Updates the rank update frequency setting for the application and schedules rank updates accordingly.
 *
 * @param {Object} interaction - The interaction object containing user input and context.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves once the operation is completed.
 */
export default async function setRankUpdateFrequency(interaction) {
    const frequency = interaction.options.getString('frequency');

    await pool.query(
        'UPDATE settings SET value = $1 WHERE key = \'rank_update_frequency\'',
        [frequency]
    );

    await interaction.reply({
        content: await translatedMessage(interaction, "info.roleUpdateFrequencySet", {frequency}),
        flags: MessageFlags.Ephemeral
    });
}