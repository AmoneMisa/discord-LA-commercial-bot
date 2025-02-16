import { MessageFlags } from 'discord.js';

export default async function blockReviewer(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('INSERT INTO blocked_reviewers (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    await interaction.reply({
        content: `🚫 **${user.username}** теперь не может оставлять отзывы.`,
        flags: MessageFlags.Ephemeral
    });
}
