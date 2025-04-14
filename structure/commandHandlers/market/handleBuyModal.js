import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {translatedMessage} from "../../utils.js";

export default async function(interaction) {
    const [_, __, lotId] = interaction.customId.split("_");
    const goldAmount = parseInt(interaction.fields.getTextInputValue("buy_amount"));
    const comment = interaction.fields.getTextInputValue("buy_comment") || "_нет_";

    if (isNaN(goldAmount) || goldAmount <= 0) {
        return interaction.reply({ content: await translatedMessage(interaction,"errors.setCorrectGoldAmount"), ephemeral: true });
    }

    const lotData = await pool.query("SELECT * FROM marketplace_lots WHERE id = $1", [lotId]);
    if (lotData.rowCount === 0) {
        return interaction.reply({ content: await translatedMessage(interaction,"errors.lotNotFound"), ephemeral: true });
    }

    const lot = lotData.rows[0];

    const sellerUser = await interaction.client.users.fetch(lot.seller_id);
    await sellerUser.send({
        content: (await translatedMessage(interaction,"market.sellerMessage", {userId: interaction.user.id, goldAmount, comment})),
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

    await interaction.reply({ content: await translatedMessage(interaction,"market.requestSent"), ephemeral: true });
}
