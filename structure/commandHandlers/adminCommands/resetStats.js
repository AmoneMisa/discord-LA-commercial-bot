import { MessageFlags } from 'discord.js';

export default async function resetStats(interaction, pool) {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

    await interaction.reply({
        content: `🔄 Статистика полностью сброшена.`,
        flags: MessageFlags.Ephemeral
    });
}
