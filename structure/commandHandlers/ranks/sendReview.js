import {MessageFlags} from "discord.js";
import updateRatings from "../../updateRatings.js";
import sendReviewNotification from "./sendReviewNotification.js";

export default async function (interaction, pool, client) {
    const [_, action, userId] = interaction.customId.split('_');
    const reviewerId = interaction.user.id;
    const reviewText = interaction.fields.getTextInputValue('review_text');
    const isPositive = action === 'upvote';

    try {
        await pool.query(
            `INSERT INTO reviews (target_user, reviewer_id, is_positive, review_text, timestamp)
                 VALUES ($1, $2, $3, $4, NOW())`,
            [userId, reviewerId, isPositive, reviewText]
        );

        const userStats = await pool.query(
            `SELECT COUNT(CASE WHEN is_positive THEN 1 END)     AS positive_reviews,
                        COUNT(CASE WHEN NOT is_positive THEN 1 END) AS negative_reviews
                 FROM reviews
                 WHERE target_user = $1`,
            [userId]
        );

        const {positive_reviews, negative_reviews} = userStats.rows[0];
        const rating = positive_reviews - negative_reviews;

        await pool.query(
            `UPDATE users
                 SET positive_reviews = $1,
                     negative_reviews = $2,
                     rating = $3
                 WHERE user_id = $4`,
            [positive_reviews, negative_reviews, rating, userId]
        );

        await interaction.reply({
            content: '✅ Ваш отзыв сохранён!',
            flags: MessageFlags.Ephemeral
        });

        await updateRatings(pool);
        await sendReviewNotification(pool, userId, reviewerId, isPositive, reviewText, client);
    } catch (error) {
        console.error('❌ Ошибка при сохранении отзыва:', error);
        return interaction.reply({
            content: '❌ Произошла ошибка при сохранении отзыва. Попробуйте позже.',
            flags: MessageFlags.Ephemeral
        });
    }
}