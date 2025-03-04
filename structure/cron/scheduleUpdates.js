import cron from "node-cron";
import setRolesByRanks from "../setRolesByRanks.js";
import updateRatings from "../updateRatings.js";
import updateLeaderboard from "../commandHandlers/updateLeaderboard.js";

export async function scheduleRankUpdates(frequency, pool, guild) {
    if (!frequency) {
        frequency = await pool.query('SELECT value FROM settings WHERE key = \'rank_update_frequency\'');
    }

    let scheduleTime;

    if (frequency.rows[0].value) {
        switch (frequency) {
            case '1d':
                scheduleTime = '0 0 * * *';
                break;  // Каждый день
            case '3d':
                scheduleTime = '0 0 */3 * *';
                break; // Раз в 3 дня
            case '1w':
                scheduleTime = '0 0 * * 0';
                break; // Раз в неделю
            case '2w':
                scheduleTime = '0 0 */14 * *';
                break; // Раз в 2 недели
            case '1m':
                scheduleTime = '0 0 1 * *';
                break; // Раз в месяц
            case '3m':
                scheduleTime = '0 0 1 */3 *';
                break; // Раз в квартал
            default:
                return;
        }
    }

    cron.schedule(scheduleTime, async () => {
        await setRolesByRanks(pool, guild);
    });
}

export function schedulersList(pool, client, guild) {
    cron.schedule('0 0 * * *', async () => {
        await updateRatings(pool);
        await updateLeaderboard(client, pool);
    });

    scheduleRankUpdates(null, pool, guild);
}