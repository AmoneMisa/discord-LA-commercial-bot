import handleInfoCommand from "../commandHandlers/ranks/handleInfoCommand.js";
import lastPositiveReviewsCommand from "../commandHandlers/ranks/lastPositiveReviewsCommand.js";
import lastNegativeReviewsCommand from "../commandHandlers/ranks/lastNegativeReviewsCommand.js";
import lastReviewsCommand from "../commandHandlers/ranks/lastReviewsCommand.js";
import handleAdminSettingsCommand from "../commandHandlers/handleAdminCommand.js";
import worstSellers from "../commandHandlers/ranks/worstSellers.js";
import subscribeToBuy from "../commandHandlers/subscribe/subscribeToBuy.js";
import subscribeList from "../commandHandlers/subscribe/subscribeList.js";
import unSubscribeToBuy from "../commandHandlers/subscribe/unSubscribeToBuy.js";
import createLotHandler from "../commandHandlers/tradeSystem/createLotHandler.js";
import removeLotHandler from "../commandHandlers/tradeSystem/removeLotHandler.js";
import auctionHouseHandler from "../commandHandlers/tradeSystem/auctionHouseHandler.js";
import handleProfileView from "../commandHandlers/profile/handleProfileView.js";
import handleProfileEdit from "../commandHandlers/profile/handleProfileEdit.js";
import handleProfileFill from "../commandHandlers/profile/handleProfileFill.js";
import reviewNotificationsToggle from "../commandHandlers/ranks/reviewNotificationsToggle.js";
import manualSendNotificationsToBuyers from "../commandHandlers/subscribe/manualSendNotificationsToBuyers.js";
import getAchievementInfo from "../commandHandlers/achievements/getAchievementInfo.js";
import flipCoin from "../commandHandlers/randomGames/flipCoin.js";
import pickRandom from "../commandHandlers/randomGames/pickRandom.js";
import randomNumber from "../commandHandlers/randomGames/randomNumber.js";
import rollDice from "../commandHandlers/randomGames/rollDice.js";
import {handleGetCodex} from "../commandHandlers/codex/handleGetCodex.js";
import pickFromChannel from "../commandHandlers/randomGames/pickFromChannel.js";
import pickOnlineFromChannel from "../commandHandlers/randomGames/pickOnlineFromChannel.js";
import pickFromMentions from "../commandHandlers/randomGames/pickFromMentions.js";

/**
 * Handles multiple interaction commands based on the command name and subcommand provided in the interaction object.
 *
 * Executes specific functions based on the command name, utilizing different handlers for different features.
 *
 * @param {Object} interaction - The interaction object from the discord bot containing command details.
 * @param {Object} pool - The database connection pool used for database operations.
 * @param {Object} client - The discord bot client for accessing bot-specific functionalities.
 *
 * Command names and their handlers:
 * - 'info': Calls the `handleInfoCommand` function.
 * - 'last_positive_reviews': Calls the `lastPositiveReviewsCommand` function.
 * - 'last_negative_reviews': Calls the `lastNegativeReviewsCommand` function.
 * - 'last_reviews': Calls the `lastReviewsCommand` function.
 * - Commands starting with 'adm_' and where the subcommand is not 'remove_bots': Calls the `handleAdminSettingsCommand` function.
 * - 'worst_sellers': Calls the `worstSellers` function.
 * - 'auction_house': Calls the `auctionHouseHandler` function.
 * - 'subscribe': Calls various subscription-related functions based on the subcommand:
 *   - 'to_buy': Calls the `subscribeToBuy` function.
 *   - 'list': Calls the `subscribeList` function.
 *   - 'unsubscribe': Calls the `unSubscribeToBuy` function.
 *   - 'send_notification': Calls the `manualSendNotificationsToBuyers` function.
 * - 'inventory': Calls inventory-related functions based on the subcommand:
 *   - 'create': Calls the `createLotHandler` function.
 *   - 'list': Calls the `removeLotHandler` function.
 * - 'profile': Calls profile-related functions based on the subcommand:
 *   - 'view': Calls the `handleProfileView` function.
 *   - 'edit': Calls the `handleProfileEdit` function.
 *   - 'fill': Calls the `handleProfileFill` function.
 * - 'review_notifications_toggle': Calls the `reviewNotificationsToggle` function.
 * - 'achievement-info': Calls the `getAchievementInfo` function.
 * - 'flip_coin': Calls the `flipCoin` function.
 * - 'pick_random': Calls the `pickRandom` function.
 * - 'random_number': Calls the `randomNumber` function.
 * - 'roll_dice': Calls the `rollDice` function.
 */
export default async function (interaction, pool, client) {
    if (interaction.commandName === 'info') {
        await handleInfoCommand(interaction, pool, false);
    }

    if (interaction.commandName === 'last_positive_reviews') {
        await lastPositiveReviewsCommand(interaction, pool);
    }

    if (interaction.commandName === 'last_negative_reviews') {
        await lastNegativeReviewsCommand(interaction, pool);
    }

    if (interaction.commandName === 'last_reviews') {
        await lastReviewsCommand(interaction, pool);
    }

    if (interaction.commandName.startsWith("adm_") && interaction.options.getSubcommand() !== 'remove_bots') {
        await handleAdminSettingsCommand(interaction, pool, interaction.guild);
    }

    if (interaction.commandName === 'worst_sellers') {
        await worstSellers(interaction, pool);
    }

    if (interaction.commandName === 'auction_house') {
        await auctionHouseHandler(interaction, pool);
    }

    if (interaction.commandName === 'subscribe') {
        if (interaction.options.getSubcommand() === 'to_buy') {
            await subscribeToBuy(interaction, pool);
        }

        if (interaction.options.getSubcommand() === 'list') {
            await subscribeList(interaction, pool);
        }

        if (interaction.options.getSubcommand() === 'unsubscribe') {
            await unSubscribeToBuy(interaction, pool);
        }

        if (interaction.options.getSubcommand() === 'send_notification') {
            await manualSendNotificationsToBuyers(interaction, pool);
        }
    }

    if (interaction.commandName === 'inventory') {
        if (interaction.options.getSubcommand() === 'create') {
            await createLotHandler(interaction, pool, client);
        }

        if (interaction.options.getSubcommand() === 'list') {
            await removeLotHandler(interaction, pool);
        }
    }

    if (interaction.commandName === 'profile') {
        if (interaction.options.getSubcommand() === 'view') {
            await handleProfileView(interaction, pool);
        }

        if (interaction.options.getSubcommand() === 'edit') {
            await handleProfileEdit(interaction, pool);
        }

        if (interaction.options.getSubcommand() === 'fill') {
            await handleProfileFill(interaction, pool);
        }
    }

    if (interaction.commandName === 'review_notifications_toggle') {
        await reviewNotificationsToggle(interaction, pool);
    }

    if (interaction.commandName === 'achievement-info') {
        await getAchievementInfo(interaction, pool);
    }

    if (interaction.commandName === 'flip_coin') {
        await flipCoin(interaction);
    }

    if (interaction.commandName === 'pick_random') {
        await pickRandom(interaction);
    }

    if (interaction.commandName === 'pick_from_channel') {
        await pickFromChannel(interaction);
    }

    if (interaction.commandName === 'pick_online_from_channel') {
        await pickOnlineFromChannel(interaction);
    }

    if (interaction.commandName === 'pick_from_mentions') {
        await pickFromMentions(interaction);
    }

    if (interaction.commandName === 'random_number') {
        await randomNumber(interaction);
    }

    if (interaction.commandName === 'roll_dice') {
        await rollDice(interaction);
    }

    if (interaction.commandName === 'get_codex') {
        await handleGetCodex(interaction, pool);
    }

    if (interaction.commandName === "Получить инфо или оставить отзыв") {
        await handleInfoCommand(interaction, pool, true);
    }
}