import { MessageFlags } from 'discord.js';

export default async function resetUserStats(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('UPDATE users SET rating = 0, positive_reviews = 0, negative_reviews = 0 WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: `🔄 Статистика пользователя **${user.username}** сброшена.`,
        flags: MessageFlags.Ephemeral
    });
}
