import {MessageFlags} from "discord.js";
import updateRatings from "../../updateRatings.js";
import sendReviewNotification from "./sendReviewNotification.js";
import errorsHandler from "../../../errorsHandler.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles the interaction for submitting a user review.
 *
 * This function parses the interaction data to gather the action (upvote/downvote),
 * the target user's ID, the review text, and the reviewer's ID. It then saves
 * the review information into the database, calculates the updated ratings
 * for the target user, and updates their statistics.
 * Additionally, it sends a confirmation reply to the reviewer and triggers
 * related functionalities like updating ratings and sending notifications.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing data about the review submission.
 */
export default async function (interaction) {
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
                 rating           = $3
             WHERE user_id = $4`,
            [positive_reviews, negative_reviews, rating, userId]
        );

        await interaction.reply({
            content: await translatedMessage(interaction, "info.reviewSaved"),
            flags: MessageFlags.Ephemeral
        });

        await updateRatings();
        await sendReviewNotification(interaction, userId, reviewerId, isPositive, reviewText);
    } catch (error) {
        errorsHandler.error(`'❌ Ошибка при сохранении отзыва: ${error}`);
        await interaction.reply({
            content: await translatedMessage(interaction, "errors.reviewSaveError"),
            flags: MessageFlags.Ephemeral
        });
    }
}