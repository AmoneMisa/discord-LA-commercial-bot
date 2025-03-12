import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Sends a review notification to a target user if their notification settings allow it.
 * The notification includes information about the review such as the reviewer, positivity, and review text.
 *
 * @param interaction
 * @param {Object} pool - The database connection pool for querying user settings.
 * @param {string} targetUserId - The ID of the user who will receive the notification.
 * @param {string} reviewerId - The ID of the user who wrote the review.
 * @param {boolean} isPositive - Indicates whether the review is positive (true) or negative (false).
 * @param {string} [reviewText] - The text content of the review (optional).
 * @param {Object} client - The client instance used to fetch Discord user data and send messages.
 * @return {Promise<void>} A promise that resolves when the notification process is complete.
 */
export default async function sendReviewNotification(interaction, pool, targetUserId, reviewerId, isPositive, reviewText, client) {
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
        const type = isPositive ? i18n.t("info.reviewPositive", { lng: await getUserLanguage(interaction.user.id, pool)}) : i18n.t("info.reviewNegative", { lng: await getUserLanguage(interaction.user.id, pool)});

        if (targetUser) {
            await targetUser.send({
                content: `${emoji} **${i18n.t("info.receivedReview", { lng: userLanguage, reviewer: `<@${reviewer.id}>`, type })}**\n\n> ${reviewText || i18n.t("info.noComment", { lng: userLanguage })}`
            }).catch((e) => {
                console.log(`Не удалось отправить уведомление пользователю: ${targetUserId}`, `Объект пользователя: ${targetUser}`, e);
            });
        }
    } catch (err) {
        throw new Error(`Ошибка при отправке уведомления о новом отзыве:" ${err}`);
    }
}
