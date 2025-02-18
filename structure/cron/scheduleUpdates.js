import setRolesByRanks from "../setRolesByRanks.js";
import updateRatings from "../updateRatings.js";
import updateLeaderboard from "../commandHandlers/updateLeaderboard.js";
import cron from 'node-cron';
import {saveProfileToDB} from "../../scrapping/parser.js";

export async function scheduleRankUpdates(frequency, pool, guild) {
    frequency = frequency || await pool.query('SELECT value FROM settings WHERE key = \'rank_update_frequency\'');
    let scheduleTime;

    if (frequency) {
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
        setRolesByRanks(pool, guild);
    });
}

export function schedulersList(pool, client, guild) {
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Обновление данных профилей из оружейной...');
        const players = await pool.query('SELECT main_nickname FROM profiles');
        for (const player of players.rows) {
            await saveProfileToDB(player.nickname);
        }

        await updateRatings(pool);
        await updateLeaderboard(client, pool);
        await scheduleRankUpdates(null, pool, guild);
    });
}