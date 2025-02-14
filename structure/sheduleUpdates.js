import schedule from 'node-schedule';

export function scheduleRankUpdates(frequency, pool, guild) {
    schedule.gracefulShutdown(); // Очищаем старые задачи

    let scheduleTime;
    switch (frequency) {
        case '1d': scheduleTime = '0 0 * * *'; break;  // Каждый день
        case '3d': scheduleTime = '0 0 */3 * *'; break; // Раз в 3 дня
        case '1w': scheduleTime = '0 0 * * 0'; break; // Раз в неделю
        case '2w': scheduleTime = '0 0 */14 * *'; break; // Раз в 2 недели
        case '1m': scheduleTime = '0 0 1 * *'; break; // Раз в месяц
        case '3m': scheduleTime = '0 0 1 */3 *'; break; // Раз в квартал
        default: return;
    }

    schedule.scheduleJob(scheduleTime, async () => {
        console.log('🔄 Обновление ролей продавцов...');
        const roles = await pool.query('SELECT * FROM roles ORDER BY required_rating DESC');

        const users = await pool.query('SELECT * FROM users');

        for (const user of users.rows) {
            let bestRole = null;
            for (const role of roles.rows) {
                if (user.rating >= role.required_rating &&
                    (user.positive_reviews + user.negative_reviews) >= role.min_reviews &&
                    user.positive_reviews >= role.min_positive_reviews &&
                    user.negative_reviews <= role.min_negative_reviews) {
                    bestRole = role;
                    break;
                }
            }

            const member = await guild.members.fetch(user.user_id).catch(() => null);
            if (member && bestRole) {
                let roleToAssign = guild.roles.cache.get(bestRole.role_id);
                if (roleToAssign) {
                    for (const role of roles.rows) {
                        let existingRole = guild.roles.cache.get(role.role_id);
                        if (existingRole && member.roles.cache.has(existingRole.id)) {
                            await member.roles.remove(existingRole).catch(() => null);
                        }
                    }
                    await member.roles.add(roleToAssign).catch(() => null);
                    console.log(`✅ Назначена роль ${bestRole.role_name} пользователю ${member.user.username}`);
                }
            }
        }
    });
}