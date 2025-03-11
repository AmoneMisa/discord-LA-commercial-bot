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
import createBetHandler from "../commandHandlers/bets/createBetHandler.js";
import updateBet from "../commandHandlers/bets/updateBet.js";
import updateBetModal from "../commandHandlers/bets/updateBetModal.js";
import userChangeLanguage from "../commandHandlers/common/userChangeLanguage.js";

/**
 * Handles various Discord interaction commands based on the command name and subcommands.
 * Executes specific functions for each recognized command or subcommand to provide the corresponding functionality.
 *
 * @async
 * @param {Object} interaction - The interaction object representing the incoming Discord command interaction.
 * @param {Object} pool - The database connection pool object used for database operations.
 * @param {Object} client - The Discord client instance (optional, used in specific commands).
 */
export default async function (interaction, pool, client) {
    if (interaction.commandName === 'info') {
        await handleInfoCommand(interaction, pool, false, false);
    }

    if (interaction.commandName === 'last_positive_reviews') {
        await lastPositiveReviewsCommand(interaction, pool, false, false);
    }

    if (interaction.commandName === 'last_negative_reviews') {
        await lastNegativeReviewsCommand(interaction, pool, false, false);
    }

    if (interaction.commandName === 'last_reviews') {
        await lastReviewsCommand(interaction, pool, false, false);
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
            await manualSendNotificationsToBuyers(interaction, pool, client);
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
            await handleProfileView(interaction, pool, false, false);
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

    if (interaction.commandName === 'create_bet') {
        await createBetHandler(interaction, pool, false, false);
    }

    if (interaction.commandName === 'update_bet') {
        await updateBet(interaction, pool, false, false);
    }

    if (interaction.commandName === 'language') {
        await userChangeLanguage(interaction, pool);
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

    // обработчики команд контекстного меню
    if (interaction.commandName === "Получить инфо или оставить отзыв") {
        await handleInfoCommand(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }

    if (interaction.commandName === "Подписаться на продавца") {
        await subscribeToBuy(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }

    if (interaction.commandName === "Просмотреть профиль игрока") {
        await handleProfileView(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }

    if (interaction.commandName === 'Последние положительные отзывы пользователя') {
        await lastPositiveReviewsCommand(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }

    if (interaction.commandName === 'Последние отрицательные отзывы пользователя') {
        await lastNegativeReviewsCommand(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }

    if (interaction.commandName === 'Последние отзывы пользователя') {
        await lastReviewsCommand(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }

    if (interaction.commandName === 'Поставить ставку') {
        await createBetHandler(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }

    if (interaction.commandName === 'Увеличить ставку') {
        await updateBetModal(interaction, pool, true, interaction.isMessageContextMenuCommand());
    }
}