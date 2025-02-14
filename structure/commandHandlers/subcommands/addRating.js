import { MessageFlags } from 'discord.js';

export default async function addRating(interaction, pool) {
    const user = interaction.options.getUser('user');
    const points = interaction.options.getInteger('points');

    await pool.query('UPDATE users SET rating = rating + $1 WHERE user_id = $2', [points, user.id]);

    await interaction.reply({
        content: `⭐ **${points}** баллов добавлено к рейтингу **${user.username}**.`,
        flags: MessageFlags.Ephemeral
    });
}
