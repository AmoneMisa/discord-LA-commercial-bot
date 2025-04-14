import setRolesByRanks from "../setRolesByRanks.js";
import updateRatings from "../updateRatings.js";
import updateLeaderboard from "../commandHandlers/updateLeaderboard.js";
import cron from 'node-cron';
import {saveProfileToDB} from "../../scrapping/parser.js";
import checkMatching from "../commandHandlers/tradeSystem/checkMatching.js";
import removeExpiredLots from "../commandHandlers/tradeSystem/removeExpiredLots.js";
import {cleanOldData, resetActivityPoints} from "../dbUtils.js";

/**
 * Schedules rank updates based on the provided frequency or the default stored in the database.
 *
 * @param {string} frequency - The frequency of rank updates (e.g., '1d', '3d', '1w', '2w', '1m', '3m').
 *                             If not provided, it queries the default value from the database.
 * @param {Object} guild - The Discord guild object, required for rank update operations.
 *
 * @return {Promise<void>} A promise that resolves when the scheduling has been set up or exits early if
 *                         the frequency is invalid.
 */
export async function scheduleRankUpdates(frequency, guild) {
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
       await setRolesByRanks(guild);
    });
}

/**
 * Configures and schedules various tasks for maintaining profiles, updating leaderboards,
 * resetting activity points, and cleaning old data in the application.
 *
 * @param {Guild} guild - The Discord guild object for performing operations tied to a specific server.
 * @return {void} Does not return a value. The function sets up scheduled tasks that run automatically.
 */
export function schedulersList(guild) {
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Обновление данных профилей из оружейной...');
        const players = await pool.query('SELECT main_nickname FROM profiles');
        for (const player of players.rows) {
            await saveProfileToDB(player.nickname);
        }
        console.log('🔄 Обновление данных профилей из оружейной завершено!');

        await updateRatings();
        await updateLeaderboard();
    });

    scheduleRankUpdates(null, guild);

    cron.schedule('* * * * *', async () => {
        await removeExpiredLots();
        await checkMatching();
    });

    cron.schedule('0 0 * * 1', async () => {
        console.log("🔄 Сбрасываем очки активности...");
        await resetActivityPoints();
        console.log("✅ Очки сброшены!");
    });

    cron.schedule('0 3 1 * *', async () => {
        console.log("🗑️ Очищаем старые записи...");
        await cleanOldData();
        console.log("✅ Очистка завершена!");
    });
}