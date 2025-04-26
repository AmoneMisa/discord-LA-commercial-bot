import {createLot, translatedMessage} from "../../utils.js";
import {MessageFlags} from "discord.js";

export default async function(interaction) {
    const goldAmount = interaction.options.getInteger("amount");
    const price = interaction.options.getNumber("price");
    const delivery = interaction.options.getString("delivery");
    const minOrder = interaction.options.getInteger("min_order");
    const server = interaction.options.getString("server");

    try {
        await createLot({
            goldAmount,
            pricePerThousand: price,
            method: delivery,
            minOrder,
            server
        }, interaction.user.id);

        await interaction.reply({
            content: await translatedMessage(interaction, "market.lotCreated"),
            flags: MessageFlags.Ephemeral
        });
    } catch (err) {
        console.error("Ошибка при создании лота:", err);
        await interaction.reply({
            content: await translatedMessage(interaction, "market.lotCreateFailed"),
            flags: MessageFlags.Ephemeral
        });
    }
}
