import {MessageFlags, PermissionsBitField} from "discord.js";
import {sendPaginatedReviews} from "../../utils.js";

export default async function (interaction, pool) {
    const [, , reviewId, userId, page] = interaction.customId.split('_');
    const parsedReviewId = parseInt(reviewId);
    const parsedPage = parseInt(page);

    if (isNaN(parsedReviewId) || isNaN(parsedPage)) {
        return interaction.reply({
            content: '❌ Ошибка: неверный ID отзыва или страницы.',
            flags: MessageFlags.Ephemeral
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!isAdmin) {
        return interaction.reply({
            content: '❌ У вас нет прав на удаление отзывов!',
            flags: MessageFlags.Ephemeral
        });
    }

    const reviewData = await pool.query('SELECT is_positive FROM reviews WHERE id = $1', [parsedReviewId]);

    if (reviewData.rows.length === 0) {
        return interaction.reply({
            content: '❌ Ошибка: отзыв не найден.',
            flags: MessageFlags.Ephemeral
        });
    }

    const isPositive = reviewData.rows[0].is_positive;

    await pool.query('DELETE FROM reviews WHERE id = $1', [parsedReviewId]);

    if (isPositive) {
        await pool.query('UPDATE users SET positive_reviews = positive_reviews - 1 WHERE user_id = $1 AND positive_reviews > 0', [userId]);
    } else {
        await pool.query('UPDATE users SET negative_reviews = negative_reviews - 1 WHERE user_id = $1 AND negative_reviews > 0', [userId]);
    }

    await pool.query('UPDATE users SET rating = positive_reviews - negative_reviews WHERE user_id = $1', [userId]);

    await sendPaginatedReviews(interaction, pool, parsedPage, userId);
}