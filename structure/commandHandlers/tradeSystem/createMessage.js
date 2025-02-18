import {ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, TextInputStyle} from "discord.js";
import tradeStringSelectMenuHandler from "./tradeStringSelectMenuHandler.js";

export async function createTradeMessage(interaction, pool, client) {
    const tradeType = interaction.options.getSubcommand().toUpperCase(); // WTT, WTB, WTS
    const itemId = interaction.options.getString('item'); // ID предмета
    let activeTrades = new Map(); // userId => { tradeType, item, effects, price, ... }

    const itemData = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (!itemData.rows.length) {
        return interaction.reply({content: '❌ Предмет не найден.', flags: MessageFlags.Ephemeral});
    }

    const item = itemData.rows[0];
    let components = [];

    switch (tradeType) {
        case 'WTT': // ОБМЕН
            components = await generateTradeFields(item, pool, 'exchange');
            break;
        case 'WTB': // ПОКУПКА
            components = await generateTradeFields(item, pool, 'buy');
            break;
        case 'WTS': // ПРОДАЖА
            components = await generateTradeFields(item, pool, 'sell');
            break;
        default:
            return await interaction.reply({content: '❌ Неизвестный тип сделки.', flags: MessageFlags.Ephemeral});
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
            const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });;
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

async function generateTradeFields(item, pool, tradeType) {
    let components = [];

    if (['Ожерелье', 'Серьга', 'Кольцо'].includes(item.name)) {
        let effectOptions = await getEffectOptions(pool, 'accessory_effects', item.name);
        effectOptions = [...new Set(effectOptions), {label:"Ничего", value: "ничего"}];
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
    if (['buy', 'sell'].includes(tradeType)) {
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
                    {label:  '500к+', value: 'bt500'},
                )
        ));
    }

    return components;
}

async function getEffectOptions(pool, table, category) {
    const result = await pool.query(`SELECT category, effect_name, low_bonus, mid_bonus, high_bonus
                                     FROM ${table}`);
    return result.rows
        .filter(effect => effect.category === category || effect.category === "Общие")
        .map(effect => ({label: effect.effect_name, value: effect.effect_name}));
}