import { MessageFlags } from 'discord.js';

export default async function toggleSelfVoting(interaction, pool) {
    const enabled = interaction.options.getBoolean('enabled');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'allow_self_voting\'', [enabled]);

    await interaction.reply({
        content: `✅ Голосование за себя теперь **${enabled ? 'разрешено' : 'запрещено'}**.`,
        flags: MessageFlags.Ephemeral
    });
}
