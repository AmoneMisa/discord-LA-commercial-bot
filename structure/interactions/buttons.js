import {MessageFlags} from "discord.js";
import {sendPaginatedReviews} from "../utils.js";
import deleteReview from "../commandHandlers/ranks/deleteReview.js";
import handleEditRaidsButtons from "../commandHandlers/subscribe/handleEditRaidsButtons.js";
import handleBuyButtons from "../commandHandlers/subscribe/handleBuyButtons.js";
import sellerAnswerToBuyer from "../commandHandlers/subscribe/sellerAnswerToBuyerModal.js";
import handleRemoveLotButtons from "../commandHandlers/tradeSystem/handleRemoveLotButtons.js";
import handleExtendLot from "../commandHandlers/tradeSystem/handleExtendLot.js";
import {handleAuctionButtons} from "../commandHandlers/tradeSystem/handleAuctionButtons.js";
import reviewVote from "../commandHandlers/ranks/reviewVote.js";
import handleSendRaidResponseJoin from "../commandHandlers/responses/handleSendRaidResponseJoin.js";
import handleBuyButtonsResponse from "../commandHandlers/responses/createModalBuyResponse.js";
import handleSendRaidResponseBuy from "../commandHandlers/responses/handleSendRaidResponseBuy.js";

export default async function (interaction, pool, client) {
    if (Date.now() - interaction.message.createdTimestamp > 5 * 60 * 1000) {
        return await interaction.update({
            content: "Время на использование контролов истекло. Пожалуйста, вызовите команду заново.",
            components: [],
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.customId.startsWith('upvote_') || interaction.customId.startsWith('downvote_')) {
        await reviewVote(interaction, pool);
    }

    if (interaction.customId.startsWith('prev_reviews_') || interaction.customId.startsWith('next_reviews_')) {
        const [, , page] = interaction.customId.split('_');
        await sendPaginatedReviews(interaction, pool, parseInt(page));
    }

    if (interaction.customId.startsWith('delete_review_')) {
        await deleteReview(interaction, pool);
    }

    if (interaction.customId === 'create_raid' || interaction.customId.startsWith('delete_raid')) {
        await handleEditRaidsButtons(interaction, pool);
    }

    if (interaction.customId.startsWith('raid_buy')) {
        await handleBuyButtons(interaction);
    }

    if (interaction.customId.startsWith('seller_answer_') || interaction.customId.startsWith('seller_reject_')) {
        await sellerAnswerToBuyer(interaction, pool, client);
    }

    if (interaction.customId.startsWith('remove_lot_')) {
        await handleRemoveLotButtons(interaction, pool);
    }

    if (interaction.customId.startsWith('extend_lot_')) {
        await handleExtendLot(interaction, pool);
    }

    if (interaction.customId.startsWith("contact_")) {
        await handleAuctionButtons(interaction, pool, client);
    }

    if (interaction.customId.startsWith("join_raid_")) {
        await handleSendRaidResponseJoin(interaction, pool, client);
    }

    if (interaction.customId.startsWith("response_raid_buy_")) {
        await handleSendRaidResponseBuy(interaction, pool, client);
    }
}