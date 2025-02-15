import schedule from 'node-schedule';
import setRolesByRanks from "./setRolesByRanks.js";

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
        setRolesByRanks(pool, guild);
    });
}