import {ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";

export default async function (pool, client, activeTrades, tradeType) {
    client.on('interactionCreate', async interaction => {
        if (interaction.isMessageComponent()) {
            if (interaction.customId.startsWith('trade_select_1_')) {
                const userId = interaction.user.id;
                const trade = activeTrades.get(userId) || {};

                trade[interaction.customId] = interaction.values[0];
                activeTrades.set(userId, trade);

                const requiredFields = ['trade_select_1_negotiable', 'trade_select_1_effect_1', 'trade_select_1_effect_2', 'trade_select_1_effect_3', 'trade_select_1_price'];
                const allFilled = requiredFields.every(field => trade[field]);
                let message = `Текущие выбранные параметры:\n\n**Тип сделки:** ${tradeType}\n**Предмет:** ${trade.item}\n**Цена:** ${trade.select_1_price}\n`;

                if (trade.item.category === "Аксессуар") {
                    if (trade.select_1_effect_1) {
                        message += `${trade.select_1_effect_1}\n`;
                    }

                    if (trade.select_1_effect_2) {
                        message += `${trade.select_1_effect_2}\n`;
                    }

                    if (trade.select_1_effect_3) {
                        message += `${trade.select_1_effect_3}\n`;
                    }
                }

                if (trade.item.category === "Самоцвет") {
                    if (trade.select_1_level) {
                        message += `Уровень: ${trade.select_1_level}\n`;
                    }
                }

                message += `Торг: ${trade_select_1_negotiable ? 'Да' : 'Нет' }\n`;

                if (allFilled) {
                    await interaction.update({
                        content: message,
                        components: createFields(pool, trade.item.category, trade)
                    });

                    // Дальше можно сохранить сделку в базу или предложить подтвердить сделку
                } else {
                    // Если не все поля заполнены, просто обновляем выбор пользователя
                    await interaction.deferUpdate();
                }
            } else if (interaction.customId.startsWith('trade_select_2_')) {
                const userId = interaction.user.id;
                const trade = activeTrades.get(userId) || {};

                trade[interaction.customId] = interaction.values[0];
                activeTrades.set(userId, trade);

                const requiredFields = ['trade_select_2_server', 'trade_select_2_rarity', 'trade_select_2_effect_amount_1', 'trade_select_2_effect_amount_2', 'trade_select_2_effect_amount_3'];
                const allFilled = requiredFields.every(field => trade[field]);

                if (allFilled) {
                    await interaction.update({
                        content: "Поздравляем! Вы создали лот!",
                        components: createFields(pool, trade.item.category, trade)
                    });

                    // Дальше можно сохранить сделку в базу или предложить подтвердить сделку
                } else {
                    // Если не все поля заполнены, просто обновляем выбор пользователя
                    await interaction.deferUpdate();
                }
            }
        }
    });
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
        if (trade.select_1_effect_1) {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_2_effect_amount_1')
                    .setPlaceholder(trade.select_1_effect_1)
                    .addOptions(await getEffectOptions(pool, trade.select_1_effect_1))
            ));
        }

        if (trade.select_1_effect_2) {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_2_effect_amount_2')
                    .setPlaceholder(trade.select_1_effect_2)
                    .addOptions(await getEffectOptions(pool, trade.select_1_effect_2))
            ));
        }

        if (trade.select_1_effect_3) {
            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('trade_select_2_effect_amount_3')
                    .setPlaceholder(trade.select_1_effect_3)
                    .addOptions(await getEffectOptions(pool, trade.select_1_effect_3))
            ));
        }
    }

    return components;
}

async function getEffectOptions(pool, effectName) {
    return await pool.query(`SELECT low_bonus, mid_bonus, high_bonus FROM accesory_effects WHERE effect_name = $1`, effectName).rows;
}