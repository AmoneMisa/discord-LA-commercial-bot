import { MessageFlags } from 'discord.js';

/**
 * Toggles the self-voting setting in the database and notifies the user of the change.
 *
 * @param {Object} interaction - The interaction object representing the user's request.
 * @param {Object} pool - The database connection pool used to execute the query.
 * @return {Promise<void>} - A promise that resolves once the self-voting setting is updated and the user is notified.
 */
export default async function toggleSelfVoting(interaction, pool) {
    const enabled = interaction.options.getBoolean('enabled');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'allow_self_voting\'', [enabled]);

    await interaction.reply({
        content: `✅ Голосование за себя теперь **${enabled ? 'разрешено' : 'запрещено'}**.`,
        flags: MessageFlags.Ephemeral
    });
}
