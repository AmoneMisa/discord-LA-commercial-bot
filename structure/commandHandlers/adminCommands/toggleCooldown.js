import { MessageFlags } from 'discord.js';

/**
 * Toggles the cooldown state for voting in the database and sends a response to the interaction.
 *
 * @param {Object} interaction - The interaction object containing user input data.
 * @param {Object} pool - The database connection pool for executing queries.
 * @return {Promise<void>} A promise that resolves when the cooldown state is updated and the reply is sent.
 */
export default async function toggleCooldown(interaction, pool) {
    const enabled = interaction.options.getBoolean('enabled');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'cooldown_enabled\'', [enabled]);

    await interaction.reply({
        content: `✅ Кулдаун на голосование **${enabled ? 'включён' : 'выключен'}**.`,
        flags: MessageFlags.Ephemeral
    });
}
