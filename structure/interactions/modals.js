import sendReview from "../commandHandlers/ranks/sendReview.js";
import handleCreateRaidModal from "../commandHandlers/subscribe/handleCreateRaidModal.js";
import notifySellerMessageSend from "../commandHandlers/subscribe/notifySellerMessageSend.js";
import handleSellerAnswerToBuyerModal from "../commandHandlers/subscribe/handleSellerAnswerToBuyerModal.js";

export default async function(interaction, pool, client) {
    if (interaction.fields.fields.get('review_text') && interaction.fields.getTextInputValue('review_text')) {
        await sendReview(interaction, pool, client);
    }

    if (interaction.fields.fields.get('buyer_nickname') && interaction.fields.getTextInputValue('buyer_nickname')) {
        await notifySellerMessageSend(interaction, pool, client);
    }

    if (interaction.customId === 'create_raid_modal') {
        await handleCreateRaidModal(interaction, pool);
    }

    if (interaction.customId.startsWith('raid_buy_answer_')) {
        await handleSellerAnswerToBuyerModal(interaction, pool, client);
    }
}