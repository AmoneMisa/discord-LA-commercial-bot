import {MessageFlags} from "discord.js";
import {sendPaginatedReviews, translatedMessage} from "../utils.js";
import deleteReview from "../commandHandlers/ranks/deleteReview.js";
import handleEditRaidsButtons from "../commandHandlers/subscribe/handleEditRaidsButtons.js";
import handleBuyButtons from "../commandHandlers/subscribe/handleBuyButtons.js";
import sellerAnswerToBuyer from "../commandHandlers/subscribe/sellerAnswerToBuyerModal.js";
import handleRemoveLotButtons from "../commandHandlers/tradeSystem/handleRemoveLotButtons.js";
import handleExtendLot from "../commandHandlers/tradeSystem/handleExtendLot.js";
import {handleAuctionButtons} from "../commandHandlers/tradeSystem/handleAuctionButtons.js";
import reviewVote from "../commandHandlers/ranks/reviewVote.js";
import betContinueHandler from "../commandHandlers/bets/betContinueHandler.js";
import betTargetHandler from "../commandHandlers/bets/betTargetHandler.js";
import handleSendRaidResponseJoin from "../commandHandlers/responses/handleSendRaidResponseJoin.js";
import handleSendRaidResponseBuy from "../commandHandlers/responses/handleSendRaidResponseBuy.js";
import handleBetActionButton from "../commandHandlers/bets/handleBetActionButton.js";
import handleBetPagination from "../commandHandlers/bets/handleBetPagination.js";
import handleOrderActions from "../commandHandlers/market/handleOrderActions.js";
import handleDeleteLot from "../commandHandlers/market/handleDeleteLot.js";
import handleBuyButton from "../commandHandlers/market/handleBuyButton.js";

/**
 * Handles various types of button interactions in a Discord bot and delegates
 * them to the appropriate handler function based on the customId of the interaction.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object that triggered the event. Contains data such as the customId and message details.
 * @returns {Promise<void>} Resolves when the interaction is fully processed.
 *
 * The function processes the following types of interactions:
 * - If the interaction is older than 5 minutes, it sends an error message indicating the interaction is outdated.
 * - Handles upvote or downvote actions, passing the interaction to `reviewVote`.
 * - Handles pagination for reviews, passing parameters to `sendPaginatedReviews`.
 * - Processes review deletion requests and calls `deleteReview`.
 * - Manages raid creation or deletion actions through `handleEditRaidsButtons`.
 * - Processes raid buy actions with `handleBuyButtons`.
 * - Handles seller responses (accept or reject) through `sellerAnswerToBuyer`.
 * - Manages lot removal requests by calling `handleRemoveLotButtons`.
 * - Processes requests to extend a lot's duration using `handleExtendLot`.
 * - Handles auction-specific interactions through `handleAuctionButtons`.
 * - Manages "join raid" interactions by invoking `handleSendRaidResponseJoin`.
 * - Handles responses to raid buy actions via `handleSendRaidResponseBuy`.
 */
export default async function (interaction) {
    if (Date.now() - interaction.message.createdTimestamp > 5 * 60 * 1000 && !interaction.customId.startsWith("bet")) {
        return await interaction.update({
            content: await translatedMessage(interaction, "errors.buttonsTimeout"),
            components: [],
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.customId.startsWith('upvote_') || interaction.customId.startsWith('downvote_')) {
        const reviewerId = interaction.user.id;

        const blockedReviewer = await pool.query('SELECT * FROM blocked_reviewers WHERE user_id = $1', [reviewerId]);
        if (blockedReviewer.rows.length > 0) {
            return interaction.reply({
                content: '🚫 Вы не можете оставлять отзывы, так как вам это запрещено.',
                flags: MessageFlags.Ephemeral
            });
        }

        await reviewVote(interaction);
    }

    if (interaction.customId.startsWith('prev_reviews_') || interaction.customId.startsWith('next_reviews_')) {
        const [, , memberId, page, isPositive] = interaction.customId.split('_');
        await sendPaginatedReviews(interaction, parseInt(page), isPositive, memberId);
    }

    if (interaction.customId.startsWith('delete_review_')) {
        await deleteReview(interaction);
    }

    if (interaction.customId === 'create_raid' || interaction.customId.startsWith('delete_raid')) {
        await handleEditRaidsButtons(interaction);
    }

    if (interaction.customId.startsWith('raid_buy')) {
        await handleBuyButtons(interaction);
    }

    if (interaction.customId.startsWith('seller_answer_') || interaction.customId.startsWith('seller_reject_')) {
        await sellerAnswerToBuyer(interaction);
    }

    if (interaction.customId.startsWith('remove_lot_')) {
        await handleRemoveLotButtons(interaction);
    }

    if (interaction.customId.startsWith('extend_lot_')) {
        await handleExtendLot(interaction);
    }

    if (interaction.customId.startsWith("contact_")) {
        await handleAuctionButtons(interaction);
    }

    if (interaction.customId.startsWith("join_raid_")) {
        await handleSendRaidResponseJoin(interaction);
    }

    if (interaction.customId.startsWith("response_raid_buy_")) {
        await handleSendRaidResponseBuy(interaction);
    }
    if (interaction.customId.startsWith("bet_continue")) {
        await betContinueHandler(interaction);
    }

    if (interaction.customId.startsWith("bet_target")) {
        await betTargetHandler(interaction);
    }

    if (interaction.customId.startsWith("bet_accept") || interaction.customId.startsWith("bet_reject")) {
        await handleBetActionButton(interaction);
    }

    if (interaction.customId.startsWith("bet_page_")) {
        await handleBetPagination(interaction);
    }

    if (interaction.customId.startsWith("accept_order_") || interaction.customId.startsWith("reject_order_")) {
        await handleOrderActions(interaction);
    }

    if (interaction.customId.startsWith("market_admin.delete")) {
        await handleDeleteLot(interaction);
    }

    if (interaction.customId.startsWith("buy_lot.")) {
        await handleBuyButton(interaction);
    }
}