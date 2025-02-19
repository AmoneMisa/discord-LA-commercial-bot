import {ActionRowBuilder, MessageFlags, StringSelectMenuBuilder} from "discord.js";
import {createNewWTBLot, createNewWTSLot, createNewWTTLot} from "../../dbUtils.js";

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

        message += `Торг: ${trade.trade_select_1_negotiable ? 'Да' : 'Нет'}\n`;

        if (allFilled) {
            await interaction.editReply({
                content: message,
                components: await createFields(pool, item.category, trade),
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
            characteristics.push({effectName: trade.trade_select_1_effect_1, effectValue: trade.trade_select_2_effect_amount_1});
        }

        if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2 !== 'ничего') {
            message += `**Характеристика 2**: ${trade.trade_select_1_effect_2}: ${trade.trade_select_2_effect_amount_2}\n`;
            requiredFields.push('trade_select_2_effect_amount_2');
            characteristics.push({effectName: trade.trade_select_1_effect_2, effectValue: trade.trade_select_2_effect_amount_2});
        }

        if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3 !== 'ничего') {
            message += `**Характеристика 3**: ${trade.trade_select_1_effect_3}: ${trade.trade_select_2_effect_amount_3}\n`;
            requiredFields.push('trade_select_2_effect_amount_3');
            characteristics.push({effectName: trade.trade_select_1_effect_3, effectValue: trade.trade_select_2_effect_amount_3});
        }

        const allFilled = requiredFields.every(field => trade[field]);

        if (allFilled) {
            if (tradeType === "WTB") {
                await createNewWTBLot(pool, userId,{
                    type: tradeType.toUpperCase(),
                    itemRequest: item.name,
                    price: trade.trade_select_1_price,
                    negotiable: trade.trade_select_1_negotiable,
                    server: trade.trade_select_1_server,
                    rarity: trade.trade_select_1_rarity,
                    levelRequest: trade.trade_select_1_level || null
                }, characteristics);
            } else if (tradeType === "WTS") {
                await createNewWTSLot(pool, userId,{
                    type: tradeType.toUpperCase(),
                    itemRequest: item.name,
                    price: trade.trade_select_1_price,
                    negotiable: trade.trade_select_1_negotiable,
                    server: trade.trade_select_1_server,
                    rarity: trade.trade_select_1_rarity,
                    levelRequest: trade.trade_select_1_level || null
                }, characteristics);
            } else if (tradeType === "WTT") {
                await createNewWTTLot(pool, userId,{
                    type: tradeType.toUpperCase(),
                    itemRequest: item.name,
                    itemOffer: item.name,
                    server: trade.trade_select_1_server,
                    levelRequest: trade.trade_select_1_level || null,
                    levelOffer: trade.trade_select_1_level || null,
                    negotiable: trade.trade_select_1_negotiable
                }, characteristics);
            }

            await interaction.editReply({
                content: `Поздравляем! Вы создали лот!\n\n${message}`,
                components: []
            });
            return true;
        }
    }

    await interaction.editReply({});

    return false;
}

async function createFields(pool, category, trade) {
    let components = [];

    components.push(new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('trade_select_2_server')
            .setPlaceholder('Сервер')
            .addOptions(
                {label: 'Кратос', value: 'Кратос'},
                {label: 'Альдеран', value: 'Альдеран'},
                {label: 'Кратос и Альдеран', value: 'Кратос и Альдеран'},
            )
    ));

    components.push(new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('trade_select_2_rarity')
            .setPlaceholder('Редкость')
            .addOptions(
                {label: 'Реликтовый', value: 'Реликтовый'},
                {label: 'Древний', value: 'Древний'}
            )
    ));

    if (category === 'Аксессуар') {
        if (trade.trade_select_1_effect_1 && trade.trade_select_1_effect_1.toLowerCase() !== 'ничего') {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_2_effect_amount_1')
                    .setPlaceholder(trade.trade_select_1_effect_1)
                    .setOptions(await getEffectOptions(pool, trade.trade_select_1_effect_1))
            ));
        }

        if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2.toLowerCase() !== 'ничего') {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_2_effect_amount_2')
                    .setPlaceholder(trade.trade_select_1_effect_2)
                    .setOptions(await getEffectOptions(pool, trade.trade_select_1_effect_2))
            ));
        }

        if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3.toLowerCase() !== 'ничего') {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_2_effect_amount_3')
                    .setPlaceholder(trade.trade_select_1_effect_3)
                    .setOptions(await getEffectOptions(pool, trade.trade_select_1_effect_3))
            ));
        }
    }

    return components;
}

async function getEffectOptions(pool, effectName) {
    let rows = (await pool.query(`SELECT low_bonus, mid_bonus, high_bonus
                                  FROM accessory_effects
                                  WHERE effect_name = $1`, [effectName])).rows;
    if (!rows.length) {
        return [];
    }

    return Array.from(Object.values(rows[0])).map(_value => ({label: _value, value: _value}));
}