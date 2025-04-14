import {translatedMessage} from "../../utils.js";

/**
 * Sends a review notification to a target user if their notification settings allow it.
 * The notification includes information about the review such as the reviewer, positivity, and review text.
 *
 * @param interaction
 * @param {string} targetUserId - The ID of the user who will receive the notification.
 * @param {string} reviewerId - The ID of the user who wrote the review.
 * @param {boolean} isPositive - Indicates whether the review is positive (true) or negative (false).
 * @param {string} [reviewText] - The text content of the review (optional).
 * @return {Promise<void>} A promise that resolves when the notification process is complete.
 */
export default async function sendReviewNotification(interaction, targetUserId, reviewerId, isPositive, reviewText) {
    try {
        // Получаем настройки пользователя
        const userSettings = await pool.query(
            "SELECT review_notifications_enabled FROM users WHERE user_id = $1",
            [targetUserId]
        );

        if (userSettings.rows.length === 0 || !userSettings.rows[0].review_notifications_enabled) {
            return; // Уведомления отключены
        }

        // Получаем пользователя
        const targetUser = await client.users.fetch(targetUserId);
        const reviewer = await client.users.fetch(reviewerId);
        const emoji = isPositive ? "✅" : "❌";
        const type = isPositive ? await translatedMessage(interaction, "info.reviewPositive") : await translatedMessage(interaction, "info.reviewNegative");

        if (targetUser) {
            await targetUser.send({
                content: `${emoji} **${await translatedMessage(interaction, "info.receivedReview", {
                    reviewer: `<@${reviewer.id}>`,
                    type
                })}**\n\n> ${reviewText || await translatedMessage(interaction, "info.noComment")}`
            }).catch((e) => {
                console.error(`Не удалось отправить уведомление пользователю: ${targetUserId}`, `Объект пользователя: ${targetUser}`, e);
            });
        }
    } catch (err) {
        throw new Error(`Ошибка при отправке уведомления о новом отзыве:" ${err}`);
    }
}
