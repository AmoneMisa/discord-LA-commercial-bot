/**
 * Updates the ratings of users based on their reviews within the last 30 days.
 * The calculation takes into account the positivity ratio of reviews and applies
 * a weighted coefficient for the number of reviews.
 *
 * @param {Object} pool - The database connection pool used to execute the query.
 * @return {Promise<void>} A promise that resolves when the ratings update query is executed.
 */
export default async function updateRatings(pool) {
    const weight = 7; // Весовой коэффициент, контролирующий влияние количества отзывов

    await pool.query(`
        UPDATE users
        SET rating = (
            SELECT COALESCE(
                           (
                               SUM(
                                       CASE
                                           WHEN is_positive THEN 1
                                           ELSE 0
                                           END
                               )::FLOAT
                                   / COALESCE(COUNT(*), 1)::FLOAT * 100
                               ) * (1 - EXP(- COALESCE(COUNT(*), 1)::FLOAT / $1)),
                           0
                   )
            FROM reviews
            WHERE target_user = users.user_id
              AND timestamp >= NOW() - INTERVAL '30 days'
        );
    `, [weight]);

    console.log('✅ Рейтинги обновлены с учётом отзывов за 30 дней!');
}
