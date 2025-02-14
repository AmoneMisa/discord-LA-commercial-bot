import { MessageFlags } from 'discord.js';

export default async function tempBlockReviewer(interaction, pool) {
    const user = interaction.options.getUser('user');
    const hours = interaction.options.getInteger('hours');

    const unblockTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    await pool.query('INSERT INTO blocked_reviewers (user_id, unblock_time) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET unblock_time = EXCLUDED.unblock_time', [user.id, unblockTime]);

    await interaction.reply({
        content: `⏳ **${user.username}** заблокирован для оставления отзывов на **${hours} часов**.`,
        flags: MessageFlags.Ephemeral
    });
}
