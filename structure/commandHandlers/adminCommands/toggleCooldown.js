import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Toggles the cooldown state for voting in the database and sends a response to the interaction.
 *
 * @param {Object} interaction - The interaction object containing user input data.
 * @return {Promise<void>} A promise that resolves when the cooldown state is updated and the reply is sent.
 */
export default async function toggleCooldown(interaction) {
    const enabled = interaction.options.getBoolean('enabled');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'cooldown_enabled\'', [enabled]);
    await interaction.reply({
        content: await translatedMessage(interaction, "info.votingCooldown", {status: enabled ? await translatedMessage(interaction, "common.enabled") : await translatedMessage(interaction, "common.disabled")}),
        flags: MessageFlags.Ephemeral
    });
}
