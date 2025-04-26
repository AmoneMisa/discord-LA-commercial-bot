import {parse} from 'node-html-parser';
import axios from "axios";
import {delay} from "../structure/utils.js";

// Функция парсинга страницы профиля игрока
/**
 * Parses Lost Ark player profile and retrieves character information including name, gear score, and class name.
 * Ensures that characters with duplicate names are not added, and sorts characters by gear score in descending order.
 * Filters characters to identify those with a gear score of 1660 or higher.
 *
 * @param {string} nickname - The nickname of the Lost Ark player whose profile is to be parsed.
 * @return {Promise<Object|null>} A promise that resolves to an object containing the player's nickname, a list of characters, and high-level characters (gear score >= 1660), or null if an error occurs.
 */
async function parseLostArkProfile(nickname) {
    try {
        const page = await getCharacterPage(nickname);
        const charNameList = getCharacterList(page, '.profile-character-list__char');
        const characters = [];

        for (let name of charNameList) {
            if (characters.find(char => char.name === name)) {
                continue;
            }

            let _page = await getCharacterPage(name);
            let gearScore = getGearScore(_page);

            if (!gearScore) {
                console.error('❌ Ошибка получения ГС у:', name);
                continue;
            }

            let className = getClassName(_page);

            if (!className) {
                console.error('❌ Ошибка получения имени класса у:', name);
                continue;
            }

            characters.push({name, gearScore: parseFloat(gearScore), className});

            await delay(1000);
        }

        if (!characters.length) {
            console.error('❌ Персонажи не найдены по:', nickname);
            return;
        }

        characters.sort((a, b) => b.gearScore - a.gearScore);
        const highLevelChars = characters.filter(char => char.gearScore >= 1660);

        return {nickname, characters, highLevelChars};
    } catch (err) {
        console.error('❌ Ошибка парсинга:', err);
        return null;
    }
}

/**
 * Extracts a list of character names from a specified element on a webpage.
 *
 * @param {Object} page - The webpage object containing the desired element.
 * @param {string} listSelector - The CSS selector of the element containing the character list.
 * @return {string[]} An array of character names with unwanted patterns removed.
 */
function getCharacterList(page, listSelector) {
    return page.querySelector(listSelector)
        .innerText.replaceAll(/Ур\.\d+/g, '')
        .split(/\s/)
        .filter(name => name !== '');
}

/**
 * Fetches and parses a character's weaponry page from the specified URL.
 *
 * @param {string} nickname - The nickname of the character whose page is to be retrieved.
 * @return {Promise<object>} A promise that resolves to the parsed data of the character's page.
 */
async function getCharacterPage(nickname) {
    const page = await axios.get(`https://xn--80aubmleh.xn--p1ai/%D0%9E%D1%80%D1%83%D0%B6%D0%B5%D0%B9%D0%BD%D0%B0%D1%8F/${(nickname)}`)
        .catch(e => {
            console.error('Ошибка при получении оружейной', nickname, e);
        });

    return parse(page.data);
}

/**
 * Retrieves the gear score from the provided page element.
 *
 * @param {object} page - The page object containing the DOM to search for the gear score.
 * @return {string|null} The gear score as a string, or null if the element is not found.
 */
function getGearScore(page) {
    let elem = page.querySelector('.level-info2__item');

    if (!elem) {
        console.error('Элемент не найден', elem);
        return null;
    }

    return elem.innerText.match(/[\d,]+(?:\.\d+)?/)[0].replace(',', '');
}

/**
 * Retrieves the 'alt' attribute of the first element with the class
 * 'profile-character-info__img' found within the provided page.
 *
 * @param {Document} page - The DOM Document or element within which to search for the target element.
 * @return {string|null} The value of the 'alt' attribute of the found element, or null if the element is not found.
 */
function getClassName(page) {
    let elem = page.querySelector('.profile-character-info__img');
    if (!elem) {
        console.error('Элемент не найден', elem);
        return null;
    }

    return elem.attributes.alt;
}

// Функция записи данных в базу
/**
 * Saves a user profile along with associated high-level character data to the database.
 * Updates the profile and character data if they already exist, or creates new entries otherwise.
 *
 * @param {Object} pool - Database connection pool to execute queries.
 * @param {Object} profileData - Object containing profile and associated character information.
 * @param {string} profileData.userId - Unique identifier for the user.
 * @param {string} profileData.name - The name of the user.
 * @param {string} profileData.mainNickname - Main nickname associated with the user.
 * @param {string} profileData.role - The user's designated role.
 * @param {string} profileData.primeStart - Timestamp indicating when the prime membership starts.
 * @param {string} profileData.primeEnd - Timestamp indicating when the prime membership ends.
 * @param {string} profileData.raidExperience - Description of the user's raid experience.
 * @param {string} profileData.salesExperience - Description of the user's sales experience.
 * @param {string} profileData.server - The server associated with the user profile.
 * @return {Promise<void>} Resolves when all operations (inserts and updates) are completed successfully,
 *                         otherwise logs an error to the console in case of failure.
 */
export async function saveProfileToDB({
    userId,
    name,
    mainNickname,
    role,
    primeStart,
    primeEnd,
    salesExperience,
    server
}) {
    const profileData = await parseLostArkProfile(mainNickname);
    if (!profileData) {
        return;
    }

    try {
        let mainCharResult = await pool.query(`SELECT COUNT(*)
                                               FROM profiles
                                               WHERE user_id = $1`, [userId]);

        if (mainCharResult.rows[0].count > 0) {
            await pool.query(`UPDATE profiles
                              SET name             = COALESCE($1, name),
                                  main_nickname    = COALESCE($2, main_nickname),
                                  role             = COALESCE($3, role),
                                  prime_start      = COALESCE($4, prime_start),
                                  prime_end        = COALESCE($5, prime_end),
                                  sales_experience = COALESCE($6, sales_experience),
                                  server           = COALESCE($7, 'server')
                              WHERE user_id = $8`,
                [name, mainNickname, role, primeStart, primeEnd,  salesExperience, server, userId]);
        } else {
            await pool.query(`
                INSERT INTO profiles (user_id, name, main_nickname, role, prime_start, prime_end, sales_experience, server)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [userId, name, mainNickname, role, primeStart, primeEnd, salesExperience, server]);
        }

        const profileId = (await pool.query('SELECT id FROM profiles WHERE main_nickname = $1', [mainNickname])).rows[0].id;

        const dbCharacters = await pool.query(
            `SELECT id, char_name FROM characters WHERE profile_id = $1`,
            [profileId]
        );
        const inputCharacterNames = profileData.highLevelChars.map(c => c.name);

        for (const dbChar of dbCharacters.rows) {
            if (!inputCharacterNames.includes(dbChar.char_name)) {
                await pool.query(
                    `DELETE FROM characters WHERE id = $1`,
                    [dbChar.id]
                );
            }
        }
        // Вставляем персонажей
        for (const char of profileData.highLevelChars) {
            let result = await pool.query(`SELECT *
                                           FROM characters
                                           WHERE char_name = $1`, [char.name]);

            if (result.rows.length > 0) {
                await pool.query(`UPDATE characters
                                  SET class_name = COALESCE($1, class_name),
                                      char_name  = COALESCE($2, char_name),
                                      gear_score = COALESCE($3, gear_score)
                                  WHERE profile_id = $4`, [char.className, char.name, char.gearScore, profileId]);
            } else {
                await pool.query(
                    `INSERT INTO characters (profile_id, class_name, char_name, gear_score)
                     VALUES ($1, $2, $3, $4)`,
                    [profileId, char.className, char.name, char.gearScore]
                );
            }
        }

        console.log(`✅ Данные для ${mainNickname} сохранены в БД`);
    } catch (err) {
        console.error('❌ Ошибка записи в БД:', err);
    }
}
