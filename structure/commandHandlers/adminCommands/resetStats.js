import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Resets user statistics by truncating the relevant database table and restarting identity sequence.
 * Sends a confirmation reply to the interaction.
 *
 * @param {Object} interaction - The interaction object used to send a reply.
 * @return {Promise<void>} A promise that resolves once the operation is completed.
 */
export default async function resetStats(interaction) {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

    await interaction.reply({
        content: await translatedMessage(interaction, "info.resetStats"),
        flags: MessageFlags.Ephemeral
    });
}
