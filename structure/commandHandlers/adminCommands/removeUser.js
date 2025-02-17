import { MessageFlags } from 'discord.js';

export default async function removeUser(interaction, pool) {
    const user = interaction.options.getUser('user');

    await pool.query('DELETE FROM users WHERE user_id = $1', [user.id]);

    await interaction.reply({
        content: `❌ **${user.username}** удалён из статистики.`,
        flags: MessageFlags.Ephemeral
    });
}
