import {ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, TextInputStyle} from "discord.js";
import tradeStringSelectMenuHandler from "./tradeStringSelectMenuHandler.js";
import {getItemsList} from "../../dbUtils.js";

export async function createTradeMessage(interaction, pool, client) {
    const itemId = interaction.options.getString('item'); // ID предмета
    const tradeType = interaction.options.getString('type'); // Тип сделки
    let activeTrades = new Map(); // userId => { tradeType, item, effects, price, ... }

    const itemData = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (!itemData.rows.length) {
        return interaction.reply({content: '❌ Предмет не найден.', flags: MessageFlags.Ephemeral});
    }

    const item = itemData.rows[0];
    let components = [];

    if (tradeType !== "WTS" && tradeType !== "WTB" && tradeType !== "WTT") {
        return await interaction.reply({content: '❌ Неизвестный тип сделки.', flags: MessageFlags.Ephemeral});
    } else {
        components = await createFields(item, pool, tradeType, null, 1);
    }

    let response = await interaction.reply({
        content: `📦 **${tradeType}**: Вы выбрали **${item.name}**\nУкажите параметры сделки:`,
        components,
        flags: MessageFlags.Ephemeral,
        withResponse: true
    });

    const collectorFilter = i => i.user.id === interaction.user.id;

    while (true) {
        try {
            const confirmation = await response.resource.message.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000
            });

            let result = await tradeStringSelectMenuHandler(pool, client, activeTrades, tradeType, item, confirmation);

            if (result) {
                break;
            }
        } catch (e) {
            console.error(e);
            break;
        }
    }
}

export async function createFields(item, pool, tradeType, trade, step) {
    let components = [];

    if (step === 1) {
        if (['Ожерелье', 'Серьга', 'Кольцо'].includes(item.name)) {
            let effectOptions = await getEffectOptions(pool, 'accessory_effects', item.name);
            effectOptions = [...new Set(effectOptions), {label: "Ничего", value: "ничего"}];
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_1_effect_1')
                    .setPlaceholder('Эффект 1')
                    .setOptions(effectOptions)
            ));
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_1_effect_2')
                    .setPlaceholder('Эффект 2')
                    .setOptions(effectOptions)
            ));
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_1_effect_3')
                    .setPlaceholder('Эффект 3')
                    .setOptions(effectOptions)
            ));
        }

        // 🔹 Самоцветы (уровень, количество)
        if (item.category === 'Самоцвет') {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_1_level')
                    .setPlaceholder('Уровень самоцвета')
                    .addOptions({label: '5', value: '5'},
                        {label: '6', value: '6'},
                        {label: '7', value: '7'},
                        {label: '8', value: '8'},
                        {label: '9', value: '9'},
                        {label: '10', value: '10'})
            ));
        }

        // 🔹 Цена (только для WTS / WTB)
        if (tradeType === "WTS" || tradeType === "WTB") {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_1_negotiable')
                    .setPlaceholder('Возможен ли торг?')
                    .addOptions(
                        {label: 'Да', value: 'true'},
                        {label: 'Нет', value: 'false'}
                    )
            ));

            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_1_price')
                    .setPlaceholder('Приблизительная стоимость')
                    .addOptions(
                        {label: '<20к', value: 'lt20'},
                        {label: '21к < 50к', value: 'lt50'},
                        {label: '51к < 100к', value: 'lt100'},
                        {label: '101к < 150к', value: 'lt150'},
                        {label: '151к < 200к', value: 'lt200'},
                        {label: '201к < 300к', value: 'lt300'},
                        {label: '301к < 400к', value: 'lt400'},
                        {label: '401к < 500к', value: 'lt500'},
                        {label: '500к+', value: 'bt500'},
                    )
            ));
        }
    } else if (step === 2) {
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

        if (item.category === 'Аксессуар') {
            if (trade.trade_select_1_effect_1 && trade.trade_select_1_effect_1.toLowerCase() !== 'ничего') {
                components.push(new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade_select_2_effect_amount_1')
                        .setPlaceholder(trade.trade_select_1_effect_1)
                        .setOptions(await getEffectOptionValues(pool, trade.trade_select_1_effect_1))
                ));
            }

            if (trade.trade_select_1_effect_2 && trade.trade_select_1_effect_2.toLowerCase() !== 'ничего') {
                components.push(new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade_select_2_effect_amount_2')
                        .setPlaceholder(trade.trade_select_1_effect_2)
                        .setOptions(await getEffectOptionValues(pool, trade.trade_select_1_effect_2))
                ));
            }

            if (trade.trade_select_1_effect_3 && trade.trade_select_1_effect_3.toLowerCase() !== 'ничего') {
                components.push(new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade_select_2_effect_amount_3')
                        .setPlaceholder(trade.trade_select_1_effect_3)
                        .setOptions(await getEffectOptionValues(pool, trade.trade_select_1_effect_3))
                ));
            }
        }
    } else if (step === 3) {
        const itemsList = getItemsList(pool);
        components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('trade_select_3_item')
                .setPlaceholder('Желаемый предмет')
                .addOptions(itemsList)
        ));

        components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('trade_select_3_rarity')
                .setPlaceholder('Редкость')
                .addOptions({label: 'Реликтовый', value: 'Реликтовый'},
                    {label: 'Древний', value: 'Древний'}
                )
        ));
    } else if (step === 4) {
        if (['Ожерелье', 'Серьга', 'Кольцо'].includes(item.name)) {
            let effectOptions = await getEffectOptions(pool, 'accessory_effects', item.name);
            effectOptions = [...new Set(effectOptions), {label: "Ничего", value: "ничего"}];
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_4_effect_1')
                    .setPlaceholder('Эффект 1')
                    .setOptions(effectOptions)
            ));
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_4_effect_2')
                    .setPlaceholder('Эффект 2')
                    .setOptions(effectOptions)
            ));
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_4_effect_3')
                    .setPlaceholder('Эффект 3')
                    .setOptions(effectOptions)
            ));
        }

        // 🔹 Самоцветы (уровень, количество)
        if (item.category === 'Самоцвет') {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_4_level')
                    .setPlaceholder('Уровень самоцвета')
                    .addOptions({label: '5', value: '5'},
                        {label: '6', value: '6'},
                        {label: '7', value: '7'},
                        {label: '8', value: '8'},
                        {label: '9', value: '9'},
                        {label: '10', value: '10'})
            ));
        }
    } else if (step === 5 && item.category === 'Аксессуар') {
        if (item.category === 'Аксессуар') {
            if (trade.trade_select_4_effect_1 && trade.trade_select_4_effect_1.toLowerCase() !== 'ничего') {
                components.push(new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade_select_5_effect_amount_1')
                        .setPlaceholder(trade.trade_select_4_effect_1)
                        .setOptions(await getEffectOptionValues(pool, trade.trade_select_4_effect_1))
                ));
            }

            if (trade.trade_select_4_effect_2 && trade.trade_select_4_effect_2.toLowerCase() !== 'ничего') {
                components.push(new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade_select_5_effect_amount_2')
                        .setPlaceholder(trade.trade_select_4_effect_2)
                        .setOptions(await getEffectOptionValues(pool, trade.trade_select_4_effect_2))
                ));
            }

            if (trade.trade_select_4_effect_3 && trade.trade_select_4_effect_3.toLowerCase() !== 'ничего') {
                components.push(new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('trade_select_5_effect_amount_3')
                        .setPlaceholder(trade.trade_select_4_effect_3)
                        .setOptions(await getEffectOptionValues(pool, trade.trade_select_4_effect_3))
                ));
            }
        }
    }

    return components;
}

async function getEffectOptionValues(pool, effectName) {
    let rows = (await pool.query(`SELECT low_bonus, mid_bonus, high_bonus
                                  FROM accessory_effects
                                  WHERE effect_name = $1`, [effectName])).rows;
    if (!rows.length) {
        return [];
    }

    return Array.from(Object.values(rows[0])).map(_value => ({label: _value, value: _value}));
}

async function getEffectOptions(pool, table, category) {
    const result = await pool.query(`SELECT category, effect_name, low_bonus, mid_bonus, high_bonus
                                     FROM ${table}`);
    return result.rows
        .filter(effect => effect.category === category || effect.category === "Общие")
        .map(effect => ({label: effect.effect_name, value: effect.effect_name}));
}