import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

const serverKeys = {
    kratos: 'market.filters.kratos',
    alderan: 'market.filters.alderan',
    both: 'market.filters.both',
};

const deliveryKeys = {
    auction: 'market.delivery.auction',
    mail: 'market.delivery.mail',
    both: 'market.delivery.both',
};

export default async function (interaction, forceUpdate = false) {
    try {
        const {rows} = await pool.query(
            `SELECT id, server, gold_amount, price_per_thousand, delivery_method
             FROM marketplace_lots
             WHERE seller_id = $1
             LIMIT 5`,
            [interaction.user.id]
        );

        if (rows.length === 0) {
            await interaction.reply({
                content: await translatedMessage(interaction, 'market.noLots'),
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const components = [];

        for (const lot of rows) {
            const serverName = await translatedMessage(interaction, serverKeys[lot.server] || 'market.filters.both');

            components.push(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`market_admin.delete.${lot.id}`)
                        .setLabel(`🗑️ ${serverName} | ${lot.gold_amount}`)
                        .setStyle(ButtonStyle.Danger)
                )
            );
        }

        const messages = [];

        for (const lot of rows) {
            const serverName = await translatedMessage(interaction, serverKeys[lot.server] || 'market.filters.both');
            const deliveryMethod = await translatedMessage(interaction, deliveryKeys[lot.delivery_method] || 'market.delivery.both');
            const currencyText = await translatedMessage(interaction, 'market.currencyPer1k');

            messages.push(await translatedMessage(interaction, 'market.lotInfo', {
                server: serverName,
                goldAmount: lot.gold_amount,
                currency: currencyText,
                price: lot.price_per_thousand,
                delivery: deliveryMethod
            }));
        }

        const lotList = messages.join('\n');

        if (forceUpdate && interaction.channel) {
            await interaction.followUp({
                content: lotList,
                components,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: lotList,
                components,
                flags: MessageFlags.Ephemeral
            });
        }

    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: await translatedMessage(interaction, 'errors.unexpectedError'),
            flags: MessageFlags.Ephemeral
        });
    }
}