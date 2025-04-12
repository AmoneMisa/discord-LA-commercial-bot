import i18n from "../../../locales/i18n.js";
import {getExchangeRate} from '../../utils.js'
import {getUserLanguage} from "../../dbUtils.js"; // конвертация валют

// 1. Проверка доступа к команде создания лота
export function canCreateLot(member, requiredRoleId) {
    return member.roles.cache.has(requiredRoleId);
}

// 2. Получение всех активных лотов
export async function getAllLots(pool) {
    const result = await pool.query('SELECT * FROM market_lots WHERE amount > 0');
    return result.rows;
}

// 3. Создание лота
export async function createLot(pool, lotData, userId) {
    const { goldAmount, pricePerThousandRub, method, minOrder, server } = lotData;
    const createdAt = new Date().toISOString();

    await pool.query(`
        INSERT INTO market_lots (seller_id, gold_amount, price_per_thousand_rub, method, min_order, server, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, goldAmount, pricePerThousandRub, method, minOrder, server, createdAt]);

    return true;
}

// 4. Конвертация валюты в зависимости от локали
export async function convertPrice(priceRub, locale, pool) {
    const { currency, rate } = await getExchangeRate(locale, pool);
    const converted = priceRub * rate;
    return { currency, value: converted.toFixed(2) };
}

// 5. Отправка запроса на покупку продавцу
export async function sendBuyRequest(client, sellerId, buyerId, lot, amount, messageText, lang) {
    const seller = await client.users.fetch(sellerId);

    return await seller.send({
        content: i18n.t('market.newBuyRequest', {
            lng: lang,
            buyer: `<@${buyerId}>`,
            lotInfo: formatLot(lot, lang),
            message: messageText,
            amount
        }),
        components: [
            buildActionButtons(`lot_${lot.id}_confirm`, `lot_${lot.id}_reject`, lang)
        ]
    });
}

// 6. Обработка нажатий на "Выполнено" и "Отклонено"
export async function handleLotAction(pool, interaction, action, lotId, buyerId, amount) {
    const lang = await getUserLanguage(buyerId, pool);
    const buyer = await interaction.client.users.fetch(buyerId);

    if (action === 'confirm') {
        const lot = await pool.query('SELECT * FROM market_lots WHERE id = $1', [lotId]);
        const remaining = lot.rows[0].gold_amount - amount;

        if (remaining <= 0) {
            await pool.query('DELETE FROM market_lots WHERE id = $1', [lotId]);
        } else {
            await pool.query('UPDATE market_lots SET gold_amount = $1 WHERE id = $2', [remaining, lotId]);
        }

        await buyer.send(i18n.t('market.lotConfirmed', { lng: lang }));
    } else if (action === 'reject') {
        await buyer.send(i18n.t('market.lotRejected', { lng: lang }));
    }
}

// 7. Получение персональных лотов пользователя
export async function getMyLots(pool, userId) {
    const result = await pool.query('SELECT * FROM market_lots WHERE seller_id = $1', [userId]);
    return result.rows;
}

// 8. Редактирование или удаление лота
export async function updateLot(pool, lotId, userId, updatedFields) {
    const keys = Object.keys(updatedFields);
    const values = Object.values(updatedFields);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

    await pool.query(`
        UPDATE market_lots SET ${setClause} WHERE id = $1 AND seller_id = $${keys.length + 2}
    `, [lotId, ...values, userId]);
}

// 9. Фильтрация лотов по параметрам
export async function filterLots(pool, filters) {
    const clauses = [];
    const params = [];
    let i = 1;

    if (filters.server) {
        clauses.push(`server = $${i++}`);
        params.push(filters.server);
    }

    if (filters.minAmount) {
        clauses.push(`gold_amount >= $${i++}`);
        params.push(filters.minAmount);
    }

    if (filters.minOrder) {
        clauses.push(`min_order <= $${i++}`);
        params.push(filters.minOrder);
    }

    if (filters.price) {
        clauses.push(`price_per_thousand_rub <= $${i++}`);
        params.push(filters.price);
    }

    if (filters.method) {
        clauses.push(`method = $${i++}`);
        params.push(filters.method);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM market_lots ${whereClause}`, params);
    return result.rows;
}

// 🔧 Вспомогательные функции
function formatLot(lot, lang) {
    return i18n.t('market.lotDetails', {
        lng: lang,
        amount: lot.gold_amount,
        price: lot.price_per_thousand_rub,
        server: lot.server,
        method: lot.method,
        minOrder: lot.min_order
    });
}

function buildActionButtons(confirmId, rejectId, lang) {
    import {
        ActionRowBuilder,
        ButtonBuilder,
        ButtonStyle,
    } from "discord.js";
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(confirmId)
            .setLabel(i18n.t('market.confirm', { lng: lang }))
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(rejectId)
            .setLabel(i18n.t('market.reject', { lng: lang }))
            .setStyle(ButtonStyle.Danger)
    );
}
