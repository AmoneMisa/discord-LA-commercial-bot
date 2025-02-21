import {MessageFlags} from "discord.js";

const priceMap = {
    'lt20': '<20к',
    'lt50': '21к < 50к',
    'lt100': '51к < 100к',
    'lt150': '101к < 150к',
    'lt200': '151к < 200к',
    'lt300': '201к < 300к',
    'lt400': '301к < 400к',
    'lt500': '401к < 500к',
    'bt500': '500к+'
}

export default async function auctionHouseHandler(interaction, pool) {
    const page = interaction.options.getInteger('page') || 1;
    const offset = (page - 1) * 10;

    const lots = await pool.query(`
        SELECT * FROM inventory 
        ORDER BY expires_at ASC 
        LIMIT 10 OFFSET $1
    `, [offset]);

    if (lots.rows.length === 0) {
        return interaction.reply({ content: "📭 Аукционный дом пуст.", flags: MessageFlags.Ephemeral });
    }

    let message = "🏪 **Аукционный дом** (Страница " + page + ")\n";
    for (const lot of lots.rows) {
        const index = lots.rows.indexOf(lot);
        message += await createMessage(index, lot, pool);
    }

    return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
}

async function createMessage(index, lot, pool) {
    let message = `**${index + 1}.** [${lot.trade_type}] `;

    if (lot.item_offer) {
        message += `Предлагаемый предмет: ${lot.item_offer} | `;
    }

    if (lot.offer_level) {
        message += `Ур. ${lot.offer_level} | `;
    }

    if (lot.offer_rarity) {
        message += `Редкость: ${lot.offer_rarity} | `;
    }

    if (lot.price) {
        message += `Стоимость: ${priceMap[lot.price]} | `;
    }

    if (lot.server) {
        message += `Сервер: ${lot.server} | `;
    }

    if (lot.negotiable) {
        message += `Торг: ${lot.negotiable ? 'Да' : 'Нет'} | `;
    }

    if (lot.item_request) {
        message += `Запрашиваемый предмет: ${lot.item_request} | `;
    }

    if (lot.request_level) {
        message += `Ур. ${lot.request_level} | `;
    }

    if (lot.request_rarity) {
        message += `Редкость: ${lot.request_rarity} | `;
    }

    const characteristics = await getCharacteristics(pool, lot);
    const characteristicsMessage = getCharacteristicsMessage(characteristics);
    if (getCharacteristicsMessage(characteristics)) {
        message += characteristicsMessage;
    }

        return message;
}

async function getCharacteristics(pool, lot) {
    const result = await pool.query(`SELECT effect_name, effect_value FROM inventory_characteristics WHERE inventory_id = $1`, [lot.id]);
    return result.rows;
}

function getCharacteristicsMessage(characteristics = []) {
    if (!characteristics.length) {
        return '';
    }

    let message = '';

    for (let characteristic of characteristics) {
        message += `${characteristic.effect_name}: ${characteristic.effect_value}\n`;
    }

    return message;
}