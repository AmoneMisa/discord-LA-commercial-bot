import { MessageFlags } from 'discord.js';

export default async function removeBots(interaction, pool) {
    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
            content: '🚫 У вас нет прав администратора для выполнения этой команды.',
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        const bots = interaction.guild.members.cache.filter(member => member.user.bot);

        if (bots.size === 0) {
            return interaction.editReply({
                content: '✅ В базе данных нет ботов.',
                flags: MessageFlags.Ephemeral
            });
        }

        const botIds = bots.map(bot => bot.user.id);

        await pool.query(`DELETE FROM reviews WHERE reviewer_id = ANY($1) OR target_user = ANY($1)`, [botIds]);
        await pool.query(`DELETE FROM users WHERE user_id = ANY($1)`, [botIds]);

        await interaction.editReply({
            content: `✅ Удалено **${botIds.length}** ботов из базы данных.`,
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error('❌ Ошибка при удалении ботов из БД:', error);
        await interaction.editReply({
            content: '❌ Произошла ошибка при удалении ботов. Проверьте логи.',
            flags: MessageFlags.Ephemeral
        });
    }
}
