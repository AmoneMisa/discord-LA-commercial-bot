import showBuyModal from "./showBuyModal.js";

export default async function (interaction) {
    const customId = interaction.customId;
    const parts = customId.split('.');
    const lotId = parts[1];

    if (!lotId) {
        console.error('Не удалось получить lotId из customId:', customId);
        return;
    }

    await showBuyModal(interaction, lotId);
}
