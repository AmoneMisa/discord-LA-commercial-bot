import {MessageFlags} from "discord.js";
import createModalBuyResponse from "./createModalBuyResponse.js";

export default async function (interaction, pool, client) {
    // Кнопка "Хочу купить"
    const [, , , sellerId] = interaction.customId.split('_');

    if (interaction.user.id === sellerId) {
        return interaction.reply({
            content: '🚫 Вы не можете отправить заявку самому себе.',
            flags: MessageFlags.Ephemeral
        });
    }

    await createModalBuyResponse(interaction);
}