import {MessageFlags} from "discord.js";
import {createNewWTBLot, createNewWTSLot, createNewWTTLot} from "../../dbUtils.js";
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

export default async function (pool, client, activeTrades, tradeType, item, interaction) {
    await interaction.deferUpdate();

    if (interaction.customId.startsWith('trade_select_1_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};

        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = ['trade_select_1_negotiable', 'trade_select_1_price'];
        let message = `Текущие выбранные параметры:\n\n**Тип сделки:** ${tradeType}\n**Предмет:** ${item.name}\n**Цена:** ${priceMap[trade.trade_select_1_price]}\n`;

        if (['Ожерелье', 'Серьга', 'Кольцо'].includes(item.name)) {
            requiredFields.push('trade_select_1_effect_1');
            requiredFields.push('trade_select_1_effect_2');
            requiredFields.push('trade_select_1_effect_3');
        }

        if (item.category === 'Самоцвет') {
            requiredFields.push('trade_select_1_level');
        }

        if (trade.trade_select_1_effect_1 && trade.trade_select_1_effect_1 !== 'ничего') {
            message += `${trade.trade_select_1_effect_1}\n`;
        }

        if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2 !== 'ничего') {
            message += `${trade.trade_select_1_effect_2}\n`;
        }

        if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3 !== 'ничего') {
            message += `${trade.trade_select_1_effect_3}\n`;
        }

        if (trade.trade_select_1_level) {
            message += `Уровень: ${trade.trade_select_1_level}\n`;
        }

        let allFilled = requiredFields.every(field => trade[field]);

        if (tradeType !== "WTT") {
            message += `Торг: ${trade.trade_select_1_negotiable ? 'Да' : 'Нет'}\n`;
        }

        if (allFilled) {
            await interaction.editReply({
                content: message,
                components: await createFields(item, pool, tradeType, trade, 2),
                flags: MessageFlags.Ephemeral
            });
            return false;
        }
    } else if (interaction.customId.startsWith('trade_select_2_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};
        let message = `Текущие выбранные параметры:\n\n**Тип сделки:** ${tradeType}\n**Предмет:** ${item.name}\n**Цена:** ${priceMap[trade.trade_select_1_price]}\n`;

        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = ['trade_select_2_server', 'trade_select_2_rarity'];
        message += `**Сервер**: ${trade.trade_select_2_server}\n**Редкость**: ${trade.trade_select_2_rarity}\n`;

        let characteristics = [];
        if (trade.trade_select_1_effect_1 && trade.trade_select_1_effect_1 !== 'ничего') {
            message += `**Характеристика 1**: ${trade.trade_select_1_effect_1}: ${trade.trade_select_2_effect_amount_1}\n`;
            requiredFields.push('trade_select_2_effect_amount_1');
            characteristics.push({
                effectName: trade.trade_select_1_effect_1,
                effectValue: trade.trade_select_2_effect_amount_1
            });
        }

        if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2 !== 'ничего') {
            message += `**Характеристика 2**: ${trade.trade_select_1_effect_2}: ${trade.trade_select_2_effect_amount_2}\n`;
            requiredFields.push('trade_select_2_effect_amount_2');
            characteristics.push({
                effectName: trade.trade_select_1_effect_2,
                effectValue: trade.trade_select_2_effect_amount_2
            });
        }

        if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3 !== 'ничего') {
            message += `**Характеристика 3**: ${trade.trade_select_1_effect_3}: ${trade.trade_select_2_effect_amount_3}\n`;
            requiredFields.push('trade_select_2_effect_amount_3');
            characteristics.push({
                effectName: trade.trade_select_1_effect_3,
                effectValue: trade.trade_select_2_effect_amount_3
            });
        }

        if (tradeType !== "WTT") {
            message += `Торг: ${trade.trade_select_1_negotiable ? 'Да' : 'Нет'}\n`;
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
                    content: `Поздравляем! Вы создали лот!\n\n${message}`,
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
                    content: `Поздравляем! Вы создали лот!\n\n${message}`,
                    components: []
                });

                return true;
            } else if (tradeType === "WTT") {
                await interaction.editReply({
                    content: message,
                    components: await createFields(item, pool, tradeType, trade, 3),
                    flags: MessageFlags.Ephemeral
                });

                return false;
            }
        }
    } else if (interaction.customId.startsWith('trade_select_3_')) {
        const userId = interaction.user.id;
        const trade = activeTrades.get(userId) || {};

        const itemData = await pool.query('SELECT * FROM items WHERE id = $1', [trade.trade_select_3_item]);
        if (!itemData.rows.length) {
            return interaction.reply({content: '❌ Предмет не найден.', flags: MessageFlags.Ephemeral});
        }

        const requestItem = itemData.rows[0];
        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        let message = `Текущие выбранные параметры:\n\n**Тип сделки:** ${tradeType}\n**Предмет:** ${item.name}\n**Цена:** ${priceMap[trade.trade_select_1_price]}\n`;

        trade[interaction.customId] = interaction.values[0];
        activeTrades.set(userId, trade);

        const requiredFields = ['trade_select_3_item', 'trade_select_3_rarity'];
        message += `**Сервер**: ${trade.trade_select_2_server}\n**Редкость**: ${trade.trade_select_2_rarity}\n`;
        message += `**Желаемый предмет**: ${requestItem}\n**Редкость**: ${trade.trade_select_3_rarity}\n`;

        const allFilled = requiredFields.every(field => trade[field]);
        if (allFilled) {
            await interaction.editReply({
                content: message,
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
        let message = `Текущие выбранные параметры:\n\n**Тип сделки:** ${tradeType}\n**Предмет:** ${item.name}\n**Цена:** ${priceMap[trade.trade_select_1_price]}\n`;
        message += `**Сервер**: ${trade.trade_select_2_server}\n**Редкость**: ${trade.trade_select_2_rarity}\n`;
        message += `**Желаемый предмет**: ${requestItem}\n**Редкость**: ${trade.trade_select_3_rarity}\n`;

        if (['Ожерелье', 'Серьга', 'Кольцо'].includes(item.name)) {
            requiredFields.push('trade_select_4_effect_1');
            requiredFields.push('trade_select_4_effect_2');
            requiredFields.push('trade_select_4_effect_3');
        }

        if (item.category === 'Самоцвет') {
            requiredFields.push('trade_select_4_level');
        }

        if (trade.trade_select_4_effect_1 && trade.trade_select_4_effect_1 !== 'ничего') {
            message += `${trade.trade_select_4_effect_1}\n`;
        }

        if (trade.trade_select_4_effect_2 && trade.trade_select_4_effect_2 !== 'ничего') {
            message += `${trade.trade_select_4_effect_2}\n`;
        }

        if (trade.trade_select_4_effect_3 && trade.trade_select_4_effect_3 !== 'ничего') {
            message += `${trade.trade_select_4_effect_3}\n`;
        }

        if (trade.trade_select_4_level) {
            message += `Уровень: ${trade.trade_select_4_level}\n`;
        }

        let allFilled = requiredFields.every(field => trade[field]);

        if (allFilled) {
            if (item.category === 'Аксессуар') {
                await interaction.editReply({
                    content: message,
                    components: await createFields(item, pool, tradeType, trade, 5),
                    flags: MessageFlags.Ephemeral
                });

                return true;
            } else {
                await createNewWTTLot(pool, userId, {
                    type: tradeType.toUpperCase(),
                    itemRequest: item.name,
                    itemOffer: requestItem.name,
                    server: trade.trade_select_1_server,
                    levelRequest: trade.trade_select_1_level || null,
                    levelOffer: trade.trade_select_4_level || null
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
        let message = `Вы создали новый лот!\n\n**Тип сделки:** ${tradeType}\n**Предмет:** ${item.name}\n**Цена:** ${priceMap[trade.trade_select_1_price]}\n`;

        let characteristics = [];
        if (trade.trade_select_4_effect_1 && trade.trade_select_4_effect_1 !== 'ничего') {
            message += `**Характеристика 1**: ${trade.trade_select_4_effect_1}: ${trade.trade_select_5_effect_amount_1}\n`;
            requiredFields.push('trade_select_5_effect_amount_1');
            characteristics.push({
                effectName: trade.trade_select_4_effect_1,
                effectValue: trade.trade_select_5_effect_amount_1
            });
        }

        if (trade.trade_select_4_effect_2 && trade.trade_select_5_effect_2 !== 'ничего') {
            message += `**Характеристика 2**: ${trade.trade_select_4_effect_2}: ${trade.trade_select_5_effect_amount_2}\n`;
            requiredFields.push('trade_select_5_effect_amount_2');
            characteristics.push({
                effectName: trade.trade_select_4_effect_2,
                effectValue: trade.trade_select_5_effect_amount_2
            });
        }

        if (trade.trade_select_4_effect_3 && trade.trade_select_4_effect_3 !== 'ничего') {
            message += `**Характеристика 3**: ${trade.trade_select_4_effect_3}: ${trade.trade_select_5_effect_amount_3}\n`;
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
                server: trade.trade_select_1_server
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