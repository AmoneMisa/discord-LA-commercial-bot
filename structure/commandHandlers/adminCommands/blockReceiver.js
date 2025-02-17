import {MessageFlags} from 'discord.js';

export default async function blockReceiver(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('INSERT INTO blocked_receivers (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

    await interaction.reply({
        content: `🚫 **${user.username}** теперь не может получать отзывы.`,
        flags: MessageFlags.Ephemeral
    });
}
