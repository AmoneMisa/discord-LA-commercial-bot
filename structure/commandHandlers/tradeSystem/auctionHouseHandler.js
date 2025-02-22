import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";

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

/**
 * Handles the auction house interaction by displaying available lots for auction
 * and providing pagination and contact options via interactive buttons.
 *
 * @param {Object} interaction - The interaction object containing data about the user and invoked options.
 * @param {Object} pool - The database connection pool used for querying the inventory data.
 * @return {Promise<void>} - A promise that resolves once the interaction reply is sent.
 */
export default async function auctionHouseHandler(interaction, pool) {
    const userId = interaction.user.id;
    const page = interaction.options.getInteger('page') || 1;
    const offset = (page - 1) * 10;

    const lots = await pool.query(`
        SELECT * FROM inventory
        WHERE user_id != $1
        ORDER BY expires_at ASC
        LIMIT 10 OFFSET $2
    `, [userId, offset]);

    if (lots.rows.length === 0) {
        return interaction.reply({ content: "📭 Аукционный дом пуст.", flags: MessageFlags.Ephemeral });
    }

    let message = `🏪 **Аукционный дом** (Страница ${page})\n`;
    let buttons = new ActionRowBuilder();

    for (let i = 0; i < lots.rows.length; i++) {
        message += await createMessage(i, lots.rows[i], pool);

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`contact_${lots.rows[i].id}`)
                .setLabel(`Связаться: ${i + 1}`)
                .setStyle(ButtonStyle.Primary)
        );
    }

    const totalLots = await pool.query("SELECT COUNT(*) FROM inventory WHERE user_id != $1", [userId]);
    const totalPages = Math.ceil(totalLots.rows[0].count / 10);

    if (totalPages > 1) {
        let paginationButtons = new ActionRowBuilder();

        if (page > 1) {
            paginationButtons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`auction_prev_${page}`)
                    .setLabel("⬅️ Назад")
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        if (page < totalPages) {
            paginationButtons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`auction_next_${page}`)
                    .setLabel("Вперёд ➡️")
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        return interaction.reply({
            content: message,
            components: [buttons, paginationButtons],
            flags: MessageFlags.Ephemeral
        });
    }

    return interaction.reply({
        content: message,
        components: [buttons],
        flags: MessageFlags.Ephemeral
    });}

/**
 * Constructs a descriptive message string based on the provided lot details and additional characteristics.
 *
 * @param {number} index - The index of the lot in the collection, used for numbering in the message.
 * @param {Object} lot - An object representing the details of the lot (e.g., trade type, items, price, server, etc.).
 * @param {Object} pool - The database connection or resource pool to fetch additional lot characteristics.
 * @return {Promise<string>} A promise that resolves to the constructed message string for the lot.
 */
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