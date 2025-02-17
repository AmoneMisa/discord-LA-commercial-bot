import { MessageFlags } from 'discord.js';

export default async function unblockReviewer(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM blocked_reviewers WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: `✅ **${user.username}** теперь может оставлять отзывы.`,
        flags: MessageFlags.Ephemeral
    });
}
