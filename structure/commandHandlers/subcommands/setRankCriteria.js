import { MessageFlags } from 'discord.js';

export default async function setRankCriteria(interaction, pool) {
    const roleName = interaction.options.getString('role_name');
    const requiredRating = interaction.options.getInteger('required_rating');
    const minReviews = interaction.options.getInteger('min_reviews');
    const minPositiveReviews = interaction.options.getInteger('min_positive_reviews');
    const minNegativeReviews = interaction.options.getInteger('min_negative_reviews') || 0;

    const role = await pool.query('SELECT * FROM roles WHERE role_name = $1', [roleName]);

    if (role.rows.length === 0) {
        return interaction.reply({ content: `❌ Роль **${roleName}** не найдена.`, flags: MessageFlags.Ephemeral });
    }

    await pool.query(`
        UPDATE roles SET
                         required_rating = $1,
                         min_reviews = $2,
                         min_positive_reviews = $3,
                         min_negative_reviews = $4
        WHERE role_name = $5
    `, [requiredRating, minReviews, minPositiveReviews, minNegativeReviews, roleName]);

    await interaction.reply({
        content: `✅ Критерии для роли **${roleName}** обновлены:\n- Рейтинг: **${requiredRating}**\n- Мин. отзывов: **${minReviews}**\n- Мин. положительных: **${minPositiveReviews}**\n- Макс. отрицательных: **${minNegativeReviews}**`,
        flags: MessageFlags.Ephemeral
    });
}
