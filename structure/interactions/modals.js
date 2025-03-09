import sendReview from "../commandHandlers/ranks/sendReview.js";
import handleCreateRaidModal from "../commandHandlers/subscribe/handleCreateRaidModal.js";
import notifySellerMessageSend from "../commandHandlers/subscribe/notifySellerMessageSend.js";
import handleSellerAnswerToBuyerModal from "../commandHandlers/subscribe/handleSellerAnswerToBuyerModal.js";
import notifySellerResponse from "../commandHandlers/responses/notifySellerResponse.js";
import betContinueHandler from "../commandHandlers/bets/betContinueHandler.js";
import updateBet from "../commandHandlers/bets/updateBet.js";

/**
 * Handles various interactions triggered by user input in a Discord modal.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction instance containing data about the modal input and custom ID.
 * @param {Object} pool - The database connection pool used for executing queries.
 * @param {Object} client - The Discord client instance for sending messages and interacting with the Discord API.
 *
 * @description
 * - Executes specific functions depending on the input fields present in the modal and the `customId` of the interaction.
 * - Checks for the presence of specific input fields and their associated values to determine the appropriate handler function.
 *
 * Workflow:
 * - Calls `sendReview` if `review_text` input is present and has a value.
 * - Calls `notifySellerMessageSend` if `buyer_nickname` input is present and has a value.
 * - Calls `notifySellerResponse` if `raid_buyer_nickname` input is present and has a value.
 * - Calls `handleCreateRaidModal` if the interaction's `customId` matches `create_raid_modal`.
 * - Calls `handleSellerAnswerToBuyerModal` if the interaction's `customId` starts with `raid_buy_answer_`.
 */
export default async function (interaction, pool, client) {
    if (interaction.fields.fields.get('review_text') && interaction.fields.getTextInputValue('review_text')) {
        await sendReview(interaction, pool, client);
    }

    if (interaction.fields.fields.get('buyer_nickname') && interaction.fields.getTextInputValue('buyer_nickname')) {
        await notifySellerMessageSend(interaction, pool, client);
    }

    if (interaction.fields.fields.get('raid_buyer_nickname') && interaction.fields.getTextInputValue('raid_buyer_nickname')) {
        await notifySellerResponse(interaction, pool, client);
    }

    if (interaction.customId === 'create_raid_modal') {
        await handleCreateRaidModal(interaction, pool);
    }

    if (interaction.customId.startsWith('raid_buy_answer_')) {
        await handleSellerAnswerToBuyerModal(interaction, pool, client);
    }

    if (interaction.customId.startsWith('bet_modal')) {
        await betContinueHandler(interaction, pool);
    }

    if (interaction.customId.startsWith('bet_update_modal')) {
        await updateBet(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }
}