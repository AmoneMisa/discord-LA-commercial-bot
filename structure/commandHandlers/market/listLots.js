import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { translatedMessage } from '../../utils.js';

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

export default async function (interaction) {
    const { rows } = await pool.query(
        `SELECT id, seller_id, gold_amount, price_per_thousand, server, delivery_method FROM marketplace_lots LIMIT 10`
    );

    if (rows.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, 'market.noLots'),
            flags: MessageFlags.Ephemeral
        });
    }

    const components = [];

    for (const lot of rows) {
        components.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`buy_lot.${lot.id}`)
                    .setLabel(await translatedMessage(interaction, 'buttons.buyLot', { goldAmount: lot.gold_amount }))
                    .setStyle(ButtonStyle.Primary)
            )
        );
    }

    const messageParts = [];

    for (const lot of rows) {
        const serverName = await translatedMessage(interaction, serverKeys[lot.server] || 'market.filters.both');
        const deliveryMethod = await translatedMessage(interaction, deliveryKeys[lot.delivery_method] || 'market.delivery.both');

        const lotDescription = await translatedMessage(interaction, 'market.lotListItem', {
            server: serverName,
            goldAmount: lot.gold_amount,
            currency: await translatedMessage(interaction, 'market.currencyPer1k'),
            price: lot.price_per_thousand,
            delivery: deliveryMethod
        });

        messageParts.push(lotDescription);
    }

    const messageContent = messageParts.join('\n');

    await interaction.reply({
        content: messageContent,
        components,
        flags: MessageFlags.Ephemeral
    });
}
