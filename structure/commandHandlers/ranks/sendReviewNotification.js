export default async function sendReviewNotification(pool, targetUserId, reviewerId, isPositive, reviewText, client) {
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
        const type = isPositive ? "положительный" : "отрицательный";

        if (targetUser) {
            await targetUser.send({
                content: `${emoji} **Вы получили ${type} отзыв от <@${reviewer.id}>!**\n\n> ${reviewText || "_Без комментария_"}`
            }).catch(() => {
                console.log(`Не удалось отправить уведомление пользователю ${targetUserId}`);
            });
        }
    } catch (err) {
        console.error("Ошибка при отправке уведомления о новом отзыве:", err);
    }
}
