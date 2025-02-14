export default async function updateRatings(pool) {
    const weight = 28; // Весовой коэффициент, контролирующий влияние количества отзывов

    await pool.query(`
        UPDATE users
        SET rating = (
            SELECT COALESCE(
                           (SUM(CASE WHEN is_positive THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0) * 100)
                               * (1 - EXP(- COUNT(*)::FLOAT / $1)),
                           0
                   )
            FROM reviews
            WHERE target_user = users.user_id
              AND timestamp >= NOW() - INTERVAL '14 days'
            );
    `, [weight]);

    console.log('✅ Рейтинги обновлены с учётом отзывов за 14 дней!');
}
