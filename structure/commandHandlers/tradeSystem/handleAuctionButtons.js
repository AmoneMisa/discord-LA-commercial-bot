import {MessageFlags} from "discord.js";
import auctionHouseHandler from "./auctionHouseHandler.js";

/**
 * Handles interactions with auction buttons by processing user requests and sending notifications to lot owners.
 *
 * @param {Object} interaction - The interaction object representing the user's action.
 * @return {Promise<Object>} A promise that resolves to the interaction reply or the result of a paginated action.
 */
export async function handleAuctionButtons(interaction) {
    const customId = interaction.customId;
    const lotId = customId.split("_")[1];

    const lot = await pool.query("SELECT * FROM inventory WHERE id = $1", [lotId]);

    if (lot.rows.length === 0) {
        return interaction.reply({
            content: "❌ Лот уже удалён или недоступен.",
            flags: MessageFlags.Ephemeral
        });
    }

    const ownerId = lot.rows[0].user_id;
    const owner = await client.users.fetch(ownerId).catch(() => null);

    if (!owner) {
        return interaction.reply({
            content: "❌ Не удалось отправить уведомление владельцу.",
            flags: MessageFlags.Ephemeral
        });
    }

    await owner.send({
        content: `👤 Вашим предложением заинтересовались!\n**Лот:** ${lot.rows[0].item_offer}\n🔗 **Пользователь:** <@${interaction.user.id}>`
    }).catch(() => console.log(`Не удалось отправить сообщение пользователю ${ownerId}`));

    return interaction.reply({
        content: `✅ Вы отправили уведомление владельцу лота **"${lot.rows[0].item_offer}"**.`,
        flags: MessageFlags.Ephemeral
    });


    // Обработка кнопок пагинации
    if (customId.startsWith("auction_prev_") || customId.startsWith("auction_next_")) {
        const page = parseInt(customId.split("_")[2]);
        const newPage = customId.includes("prev") ? page - 1 : page + 1;

        return auctionHouseHandler(interaction, newPage);
    }
}
