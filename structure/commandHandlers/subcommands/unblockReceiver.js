import { MessageFlags } from 'discord.js';

export default async function unblockReceiver(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM blocked_receivers WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: `✅ **${user.username}** теперь может получать отзывы.`,
        flags: MessageFlags.Ephemeral
    });
}
