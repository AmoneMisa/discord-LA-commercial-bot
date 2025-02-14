import { MessageFlags } from 'discord.js';

export default async function setRankUpdateFrequency(interaction, pool) {
    const frequency = interaction.options.getString('frequency');

    await pool.query('UPDATE settings SET value = $1 WHERE key = \'rank_update_frequency\'', [frequency]);

    await interaction.reply({
        content: `✅ Частота обновления ролей установлена на **${frequency}**.`,
        flags: MessageFlags.Ephemeral
    });
}
