import { MessageFlags } from 'discord.js';

export default async function topSellers(interaction, pool) {
    const topUsers = await pool.query(
        'SELECT user_id, rating FROM users ORDER BY rating DESC LIMIT 5'
    );

    if (topUsers.rows.length === 0) {
        return interaction.reply({ content: '❌ Пока нет продавцов с рейтингом.', flags: MessageFlags.Ephemeral });
    }

    let message = `🏆 **Топ 5 продавцов** 🏆\n\n`;
    topUsers.rows.forEach((user, index) => {
        message += `**${index + 1}.** <@${user.user_id}> - **${user.rating}** рейтинга\n`;
    });

    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
}
