import { MessageFlags } from 'discord.js';

export default async function toggleCooldown(interaction, pool) {
    const enabled = interaction.options.getBoolean('enabled');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'cooldown_enabled\'', [enabled]);

    await interaction.reply({
        content: `✅ Кулдаун на голосование **${enabled ? 'включён' : 'выключен'}**.`,
        flags: MessageFlags.Ephemeral
    });
}
