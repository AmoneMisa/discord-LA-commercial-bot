import {MessageFlags} from "discord.js";
import {createNewWTBLot, createNewWTSLot, createNewWTTLot, getItemsList} from "../../dbUtils.js";
import {createFields} from "./createMessage.js";

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
 * Handles a trade interaction for managing user-created trade listings in a game or application.
 *
 * This function dynamically processes user interactions, updating trade data and guiding the user
 * through the creation of a trade listing step-by-step. Depending on the trade type and item specifics,
 * it validates input fields, updates active trade information, and orchestrates the creation of a lot.
 * The flow includes actions for trading items to sell (WTS), items to buy (WTB), or items to trade (WTT).
 *
 * @async
 * @function
 * @param {Object} pool - Database connection pool for executing queries.
 * @param {Object} client - Discord API client object.
 * @param {Map} activeTrades - Map storing currently active trades categorized by user ID.
 * @param {string} tradeType - Type of trade being created ("WTB", "WTS", or "WTT").
 * @param {Object} item - Details of the item involved in the trade.
 * @param {Object} interaction - Interaction object containing user input and event data from Discord.
 * @returns {Promise<boolean|undefined>} Returns a boolean indicating whether the interaction flow
 *                                       is complete (true for listing created, false to continue),
 *                                       or undefined if the function does not return at that point.
 */
export default async function (activeTrades, tradeType, item, interaction) {
    await interaction.deferUpdate();

    if (interaction.customId.startsWith('trade_select_1_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};

        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = [];

        if (tradeType !== "WTT") {
            requiredFields.push(['trade_select_1_negotiable', 'trade_select_1_price']);
        }

        if (['Ожерелье', 'Серьга', 'Кольцо'].includes(item.name)) {
            requiredFields.push('trade_select_1_effect_1');
            requiredFields.push('trade_select_1_effect_2');
            requiredFields.push('trade_select_1_effect_3');
        }

        if (item.category === 'Самоцвет') {
            requiredFields.push('trade_select_1_level');
        }

        let allFilled = requiredFields.every(field => trade[field]);

        if (allFilled) {
            await interaction.editReply({
                content: getMessage(trade, tradeType, item, null),
                components: await createFields(item, tradeType, trade, 2),
                flags: MessageFlags.Ephemeral
            });
            return false;
        }
    } else if (interaction.customId.startsWith('trade_select_2_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};

        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = ['trade_select_2_server', 'trade_select_2_rarity'];

        let characteristics = [];
        if (trade.trade_select_1_effect_1 && trade.trade_select_1_effect_1 !== 'ничего') {
            requiredFields.push('trade_select_2_effect_amount_1');
            characteristics.push({
                effectName: trade.trade_select_1_effect_1,
                effectValue: trade.trade_select_2_effect_amount_1
            });
        }

        if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2 !== 'ничего') {
            requiredFields.push('trade_select_2_effect_amount_2');
            characteristics.push({
                effectName: trade.trade_select_1_effect_2,
                effectValue: trade.trade_select_2_effect_amount_2
            });
        }

        if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3 !== 'ничего') {
            requiredFields.push('trade_select_2_effect_amount_3');
            characteristics.push({
                effectName: trade.trade_select_1_effect_3,
                effectValue: trade.trade_select_2_effect_amount_3
            });
        }

        const allFilled = requiredFields.every(field => trade[field]);

        if (allFilled) {
            if (tradeType === "WTB") {
                await createNewWTBLot(pool, userId, {
                    type: tradeType.toUpperCase(),
                    itemRequest: item.name,
                    price: trade.trade_select_1_price,
                    negotiable: trade.trade_select_1_negotiable,
                    server: trade.trade_select_1_server,
                    rarity: trade.trade_select_1_rarity,
                    levelRequest: trade.trade_select_1_level || null
                }, characteristics);

                await interaction.editReply({
                    content: `Поздравляем! Вы создали лот!\n\n${getMessage(trade, tradeType, item, null)}`,
                    components: []
                });

                return true;
            } else if (tradeType === "WTS") {
                await createNewWTSLot(pool, userId, {
                    type: tradeType.toUpperCase(),
                    itemRequest: item.name,
                    price: trade.trade_select_1_price,
                    negotiable: trade.trade_select_1_negotiable,
                    server: trade.trade_select_1_server,
                    rarity: trade.trade_select_1_rarity,
                    levelRequest: trade.trade_select_1_level || null
                }, characteristics);

                await interaction.editReply({
                    content: `Поздравляем! Вы создали лот!\n\n${getMessage(trade, tradeType, item, null)}`,
                    components: []
                });

                return true;
            } else if (tradeType === "WTT") {
                await interaction.editReply({
                    content: getMessage(trade, tradeType, item, null),
                    components: await createFields(item, pool, tradeType, trade, 3),
                    flags: MessageFlags.Ephemeral
                });

                return false;
            }
        }
    } else if (interaction.customId.startsWith('trade_select_3_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};

        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = ['trade_select_3_item', 'trade_select_3_rarity'];

        const allFilled = requiredFields.every(field => trade[field]);
        if (allFilled) {
            await interaction.editReply({
                content: getMessage(trade, tradeType, item, null),
                components: await createFields(item, pool, tradeType, trade, 4),
                flags: MessageFlags.Ephemeral
            });
            return false;
        }

    } else if (interaction.customId.startsWith('trade_select_4_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};

        const itemData = await pool.query('SELECT * FROM items WHERE id = $1', [trade.trade_select_3_item]);
        if (!itemData.rows.length) {
            return interaction.reply({content: '❌ Предмет не найден.', flags: MessageFlags.Ephemeral});
        }

        const requestItem = itemData.rows[0];
        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = [];

        if (['Ожерелье', 'Серьга', 'Кольцо'].includes(requestItem.name)) {
            requiredFields.push('trade_select_4_effect_1');
            requiredFields.push('trade_select_4_effect_2');
            requiredFields.push('trade_select_4_effect_3');
        }

        if (requestItem.category === 'Самоцвет') {
            requiredFields.push('trade_select_4_level');
        }

        let allFilled = requiredFields.every(field => trade[field]);

        if (allFilled) {
            if (requestItem.category === 'Самоцвет') {
                await createNewWTTLot(pool, userId, {
                    type: tradeType.toUpperCase(),
                    itemRequest: item.name,
                    itemOffer: requestItem.name,
                    server: trade.trade_select_1_server,
                    requestLevel: trade.trade_select_1_level || null,
                    offerLevel: trade.trade_select_4_level || null,
                    requestRarity: trade.trade_select_2_rarity || null,
                    offerRarity: trade.trade_select_3_rarity || null
                });

                await interaction.editReply({
                    content: `Лот создан!\n${getMessage(trade, tradeType, item, requestItem)}`,
                    components: [],
                    flags: MessageFlags.Ephemeral
                });

                return true;
            } else {
                await interaction.editReply({
                    content: getMessage(trade, tradeType, item, requestItem),
                    components: await createFields(item, pool, tradeType, trade, 5),
                    flags: MessageFlags.Ephemeral
                });

                return false;
            }
        }
    } else if (interaction.customId.startsWith('trade_select_5_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};
        const itemData = await pool.query('SELECT * FROM items WHERE id = $1', [trade.trade_select_3_item]);
        if (!itemData.rows.length) {
            return interaction.reply({content: '❌ Предмет не найден.', flags: MessageFlags.Ephemeral});
        }

        const requestItem = itemData.rows[0];
        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = [];
        let characteristics = [];

        let message = `Вы создали новый лот!\n\n${getMessage(trade, tradeType, item, requestItem)}`;

        if (trade.trade_select_1_effect_1 && trade.trade_select_1_effect_1 !== 'ничего') {
            characteristics.push({
                effectName: trade.trade_select_1_effect_1,
                effectValue: trade.trade_select_2_effect_amount_1
            });
        }

        if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2 !== 'ничего') {
            characteristics.push({
                effectName: trade.trade_select_1_effect_2,
                effectValue: trade.trade_select_2_effect_amount_2
            });
        }

        if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3 !== 'ничего') {
            characteristics.push({
                effectName: trade.trade_select_1_effect_3,
                effectValue: trade.trade_select_2_effect_amount_3
            });
        }

        if (trade.trade_select_4_effect_1 && trade.trade_select_4_effect_1 !== 'ничего') {
            requiredFields.push('trade_select_5_effect_amount_1');
            characteristics.push({
                effectName: trade.trade_select_4_effect_1,
                effectValue: trade.trade_select_5_effect_amount_1
            });
        }

        if (trade.trade_select_4_effect_2 && trade.trade_select_5_effect_2 !== 'ничего') {
            requiredFields.push('trade_select_5_effect_amount_2');
            characteristics.push({
                effectName: trade.trade_select_4_effect_2,
                effectValue: trade.trade_select_5_effect_amount_2
            });
        }

        if (trade.trade_select_4_effect_3 && trade.trade_select_4_effect_3 !== 'ничего') {
            requiredFields.push('trade_select_5_effect_amount_3');
            characteristics.push({
                effectName: trade.trade_select_4_effect_3,
                effectValue: trade.trade_select_5_effect_amount_3
            });
        }

        let allFilled = requiredFields.every(field => trade[field]);

        if (allFilled) {
            await createNewWTTLot(pool, userId, {
                type: tradeType.toUpperCase(),
                itemRequest: item.name,
                itemOffer: requestItem.name,
                server: trade.trade_select_1_server,
                requestRarity: trade.trade_select_2_rarity || null,
                offerRarity: trade.trade_select_3_rarity || null
            }, characteristics);

            await interaction.editReply({
                content: message,
                components: [],
                flags: MessageFlags.Ephemeral
            });
            return true;
        }
    }

    await interaction.editReply({});

    return false;
}

function getMessage(trade, tradeType, item, requestItem) {
    let message = `Выбранные параметры:\n\n**Тип сделки:** ${tradeType}\n**Предмет:** ${item.name}\n`;

    if (trade.trade_select_1_price) {
        message += `**Цена:** ${priceMap[trade.trade_select_1_price]}\n`;
    }

    if (trade.trade_select_1_effect_1 && trade.trade_select_1_effect_1 !== 'ничего' && trade.trade_select_2_effect_amount_1) {
        message += `**Характеристика 1**: ${trade.trade_select_1_effect_1}: ${trade.trade_select_2_effect_amount_1}\n`;
    }

    if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2 !== 'ничего' && trade.trade_select_2_effect_amount_2) {
        message += `**Характеристика 2**: ${trade.trade_select_1_effect_2}: ${trade.trade_select_2_effect_amount_2}\n`;
    }

    if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3 !== 'ничего' && trade.trade_select_2_effect_amount_3) {
        message += `**Характеристика 3**: ${trade.trade_select_1_effect_3}: ${trade.trade_select_2_effect_amount_3}\n`;
    }

    if (trade.trade_select_1_level) {
        message += `**Уровень**: ${trade.trade_select_1_level}\n`;
    }

    if (trade.trade_select_1_negotiable) {
        message += `**Торг**: ${trade.trade_select_1_negotiable ? 'Да' : 'Нет'}\n`;
    }

    if (trade.trade_select_2_server) {
        message += `**Сервер**: ${trade.trade_select_2_server}\n`;
    }

    if (trade.trade_select_2_rarity) {
        message += `**Редкость**: ${trade.trade_select_2_rarity}\n`;
    }

    if (requestItem) {
        message += `**Желаемый предмет**: ${requestItem.name}\n**Редкость**: ${trade.trade_select_3_rarity}\n`;

        if (trade.trade_select_4_effect_1 && trade.trade_select_4_effect_1 !== 'ничего' && trade.trade_select_5_effect_amount_1) {
            message += `**Характеристика 1**: ${trade.trade_select_4_effect_1}: ${trade.trade_select_5_effect_amount_1}\n`;
        }

        if (trade.trade_select_4_effect_1 && trade.trade_select_4_effect_1 !== 'ничего' && trade.trade_select_5_effect_amount_2) {
            message += `**Характеристика 2**: ${trade.trade_select_4_effect_1}: ${trade.trade_select_5_effect_amount_2}\n`;
        }

        if (trade.trade_select_4_effect_1 && trade.trade_select_4_effect_1 !== 'ничего' && trade.trade_select_5_effect_amount_3) {
            message += `**Характеристика 3**: ${trade.trade_select_4_effect_1}: ${trade.trade_select_5_effect_amount_3}\n`;
        }

        if (trade.trade_select_4_level) {
            message += `**Уровень**: ${trade.trade_select_4_level}\n`;
        }
    }


    return message;
}