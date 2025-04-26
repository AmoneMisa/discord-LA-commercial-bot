import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {getMarketLot, translatedMessage} from "../../utils.js";

export default async function(interaction) {
    const [ ,  , , lotId] = interaction.customId.split("_");
    const lot = await getMarketLot(lotId);
    let goldAmount = parseInt(interaction.fields.getTextInputValue("buy_amount"));
    goldAmount = Math.min(Math.max(goldAmount, lot.min_order), lot.gold_amount);
    const comment = interaction.fields.getTextInputValue("buy_comment") || "_нет_";

    if (isNaN(goldAmount) || goldAmount <= 0) {
        return interaction.reply({ content: await translatedMessage(interaction,"errors.setCorrectGoldAmount"), flags: MessageFlags.Ephemeral });
    }

    if (!lot) {
        return interaction.reply({ content: await translatedMessage(interaction,"errors.lotNotFound"), flags: MessageFlags.Ephemeral });
    }

    const sellerUser = await interaction.client.users.fetch(lot.seller_id);
    const totalPrice = (goldAmount / 1000) * lot.price_per_thousand;

    await sellerUser.send({
        content: (await translatedMessage(interaction,"market.sellerMessage", {userId: interaction.user.id, goldAmount, totalPrice, comment})),
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_order_${interaction.user.id}_${lotId}_${goldAmount}`)
                    .setLabel(await translatedMessage(interaction,"market.status.done"))
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_order_${interaction.user.id}_${lotId}`)
                    .setLabel(await translatedMessage(interaction,"market.status.reject"))
                    .setStyle(ButtonStyle.Danger)
            )
        ]
    });

    await interaction.reply({ content: await translatedMessage(interaction,"market.requestSent"), flags: MessageFlags.Ephemeral });
}
