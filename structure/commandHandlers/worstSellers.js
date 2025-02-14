import { MessageFlags } from 'discord.js';

export default async function worstSellers(interaction, pool) {
    const worstUsers = await pool.query(
        'SELECT user_id, rating FROM users ORDER BY rating ASC LIMIT 5'
    );

    if (worstUsers.rows.length === 0) {
        return interaction.reply({ content: '❌ Пока нет продавцов с рейтингом.', flags: MessageFlags.Ephemeral });
    }

    let message = `📉 **Топ 5 худших продавцов** 📉\n\n`;
    worstUsers.rows.forEach((user, index) => {
        message += `**${index + 1}.** <@${user.user_id}> - **${user.rating}** рейтинга\n`;
    });

    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
}
