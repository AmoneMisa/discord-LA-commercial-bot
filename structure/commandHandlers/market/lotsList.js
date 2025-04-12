import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getExchangeRate} from "../../utils.js";

export default async function (interaction, lots, page = 1, locale = 'ru') {
    const lang = locale;
    const lotsPerPage = 5;
    const start = (page - 1) * lotsPerPage;
    const end = start + lotsPerPage;
    const currentLots = lots.slice(start, end);
    const totalPages = Math.ceil(lots.length / lotsPerPage);

    const { rate, currency } = await getExchangeRate(lang);

    const embed = new EmbedBuilder()
        .setTitle(i18n.t("market.title", { lng: lang }))
        .setDescription(i18n.t("market.embedDescription", { lng: lang }))
        .setColor(0x00AE86)
        .setFooter({ text: i18n.t("common.pageFooter", { lng: lang, page, totalPages }) });

    for (const lot of currentLots) {
        const priceConverted = Math.ceil(lot.price_per_thousand * rate);
        embed.addFields({
            name: `💰 ${i18n.t("market.lotFrom", { lng: lang, seller: `<@${lot.seller_id}>` })}`,
            value: [
                `**${i18n.t("market.goldAmount", { lng: lang })}:** ${lot.gold_amount.toLocaleString()}`,
                `**${i18n.t("market.pricePerThousand", { lng: lang, value: priceConverted })}** ${currency}`,
                `**${i18n.t("market.minOrder", { lng: lang })}:** ${lot.min_order}`,
                `**${i18n.t("market.server", { lng: lang })}:** ${lot.server}`,
                `**${i18n.t("market.method", { lng: lang })}:** ${i18n.t("market.methods." + lot.method, { lng: lang })}`
            ].join('\n'),
            inline: false
        });
    }

    const buttons = new ActionRowBuilder();

    if (page > 1) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`market_prev_${page - 1}`)
                .setLabel(i18n.t("buttons.back", { lng: lang }))
                .setStyle(ButtonStyle.Secondary)
        );
    }

    if (page < totalPages) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`market_next_${page + 1}`)
                .setLabel(i18n.t("buttons.next", { lng: lang }))
                .setStyle(ButtonStyle.Secondary)
        );
    }

    currentLots.forEach(lot => {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`buy_lot_${lot.id}`)
                .setLabel(i18n.t("buttons.buy", { lng: lang }))
                .setStyle(ButtonStyle.Primary)
        );
    });

    await interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true
    });
}
