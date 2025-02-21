import {parse} from 'node-html-parser';
import axios from "axios";
import {delay} from "../structure/utils.js";

// Функция парсинга страницы профиля игрока
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

function getCharacterList(page, listSelector) {
    return page.querySelector(listSelector)
        .innerText.replaceAll(/Ур\.\d+/g, '')
        .split(/\s/)
        .filter(name => name !== '');
}

async function getCharacterPage(nickname) {
    const page = await axios.get(`https://xn--80aubmleh.xn--p1ai/%D0%9E%D1%80%D1%83%D0%B6%D0%B5%D0%B9%D0%BD%D0%B0%D1%8F/${(nickname)}`)
        .catch(e => {
            console.error('Ошибка при получении оружейной', nickname, e);
        });

    return parse(page.data);
}

function getGearScore(page) {
    let elem = page.querySelector('.level-info2__item');

    if (!elem) {
        console.error('Элемент не найден', elem);
        return null;
    }

    return elem.innerText.match(/[\d,]+(?:\.\d+)?/)[0].replace(',', '');
}

function getClassName(page) {
    let elem = page.querySelector('.profile-character-info__img');
    if (!elem) {
        console.error('Элемент не найден', elem);
        return null;
    }

    return elem.attributes.alt;
}

// Функция записи данных в базу
export async function saveProfileToDB(pool, {
    userId,
    name,
    mainNickname,
    role,
    primeStart,
    primeEnd,
    raidExperience,
    salesExperience
}) {
    const profileData = await parseLostArkProfile(mainNickname);
    if (!profileData) return;

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
                                  raid_experience  = COALESCE($6, raid_experience),
                                  sales_experience = COALESCE($7, sales_experience)
                              WHERE user_id = $8`,
                [name, mainNickname, role, primeStart, primeEnd, raidExperience, salesExperience, userId]);
        } else {
            await pool.query(`
                INSERT INTO profiles (user_id, name, main_nickname, role, prime_start, prime_end, raid_experience,
                                      sales_experience)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [userId, name, mainNickname, role, primeStart, primeEnd, raidExperience, salesExperience]);
        }

        const profileId = (await pool.query('SELECT id FROM profiles WHERE main_nickname = $1', [mainNickname])).rows[0].id;

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
