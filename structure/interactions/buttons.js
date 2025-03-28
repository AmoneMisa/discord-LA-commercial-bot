import {MessageFlags} from "discord.js";
import {sendPaginatedReviews} from "../utils.js";
import deleteReview from "../commandHandlers/ranks/deleteReview.js";
import reviewVote from "../commandHandlers/ranks/reviewVote.js";
import betContinueHandler from "../commandHandlers/bets/betContinueHandler.js";
import betTargetHandler from "../commandHandlers/bets/betTargetHandler.js";
import i18n from "../../locales/i18n.js";
import {getUserLanguage} from "../dbUtils.js";
import handleBetActionButton from "../commandHandlers/bets/handleBetActionButton.js";
import handleBetPagination from "../commandHandlers/bets/handleBetPagination.js";

/**
 * Handles various types of button interactions in a Discord bot and delegates
 * them to the appropriate handler function based on the customId of the interaction.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object that triggered the event. Contains data such as the customId and message details.
 * @param {Object} pool - The database connection pool used for executing database operations.
 * @param {Object} client - The Discord bot client instance.
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
export default async function (interaction, pool, client) {
    if (Date.now() - interaction.message.createdTimestamp > 5 * 60 * 1000 && !interaction.customId.startsWith("bet")) {
        return await interaction.update({
            content: i18n.t("errors.buttonsTimeout", { lng: await getUserLanguage(interaction.user.id, pool)}),
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

        await reviewVote(interaction, pool);
    }

    if (interaction.customId.startsWith('prev_reviews_') || interaction.customId.startsWith('next_reviews_')) {
        const [, , memberId, page, isPositive] = interaction.customId.split('_');
        await sendPaginatedReviews(interaction, pool, parseInt(page), isPositive, memberId);
    }

    if (interaction.customId.startsWith('delete_review_')) {
        await deleteReview(interaction, pool);
    }

    if (interaction.customId.startsWith("bet_continue")) {
        await betContinueHandler(interaction, pool);
    }

    if (interaction.customId.startsWith("bet_target")) {
        await betTargetHandler(interaction, pool);
    }

    if (interaction.customId.startsWith("bet_accept") || interaction.customId.startsWith("bet_reject")) {
        await handleBetActionButton(interaction, pool);
    }

    if (interaction.customId.startsWith("bet_page_")) {
        await handleBetPagination(interaction, pool);
    }
}
