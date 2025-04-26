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
import dotenv from "dotenv";
import listLots from "../commandHandlers/market/listLots.js";
import addToList from "../commandHandlers/lists/addToList.js";
import {removeFromList} from "../commandHandlers/lists/removeFromList.js";
import checkListStatus from "../commandHandlers/lists/checkListStatus.js";
import showRaidSelect from "../commandHandlers/subscribe/showRaidSelect.js";

dotenv.config();
/**
 * Handles various Discord interaction commands based on the command name and subcommands.
 * Executes specific functions for each recognized command or subcommand to provide the corresponding functionality.
 *
 * @async
 * @param {Object} interaction - The interaction object representing the incoming Discord command interaction.
 */
export default async function (interaction) {
    if (interaction.commandName.startsWith("adm_") && interaction.options.getSubcommand() !== 'remove_bots') {
        await handleAdminSettingsCommand(interaction);
    }

    if (interaction.commandName === 'language') {
        await userChangeLanguage(interaction);
    }

    if (process.env.RANKS_MODULE) {
        if (interaction.commandName === 'info') {
            await handleInfoCommand(interaction, false, false);
        }

        if (interaction.commandName === 'last_positive_reviews') {
            await lastPositiveReviewsCommand(interaction,false, false);
        }

        if (interaction.commandName === 'last_negative_reviews') {
            await lastNegativeReviewsCommand(interaction,false, false);
        }

        if (interaction.commandName === 'last_reviews') {
            await lastReviewsCommand(interaction, false, false);
        }

        if (interaction.commandName === 'worst_sellers') {
            await worstSellers(interaction);
        }

        if (interaction.commandName === 'review_notifications_toggle') {
            await reviewNotificationsToggle(interaction);
        }

        if (interaction.commandName === "Получить инфо или оставить отзыв") {
            await handleInfoCommand(interaction, true, interaction.isMessageContextMenuCommand());
        }
    }

    if (process.env.BET_MODULE) {
        if (interaction.commandName === 'create_bet') {
            await createBetHandler(interaction, false, false);
        }

        if (interaction.commandName === 'update_bet') {
            await updateBet(interaction, false, false);
        }

        if (interaction.commandName === 'Поставить ставку') {
            await createBetHandler(interaction, true, interaction.isMessageContextMenuCommand());
        }

        if (interaction.commandName === 'Изменить ставку') {
            await updateBetModal(interaction);
        }
    }

    if (process.env.SUBSCRIPTION_MODULE) {
        if (interaction.commandName === 'subscribe') {
            if (interaction.options.getSubcommand() === 'to_buy') {
                await showRaidSelect(interaction);
            }

            if (interaction.options.getSubcommand() === 'list') {
                await subscribeList(interaction);
            }

            if (interaction.options.getSubcommand() === 'unsubscribe') {
                await unSubscribeToBuy(interaction);
            }

            if (interaction.options.getSubcommand() === 'send_notification') {
                await manualSendNotificationsToBuyers(interaction);
            }
        }
    }

    if (process.env.TRADE_MODULE) {
        if (interaction.commandName === 'auction_house') {
            await auctionHouseHandler(interaction);
        }

        if (interaction.commandName === 'inventory') {
            if (interaction.options.getSubcommand() === 'create') {
                await createLotHandler(interaction);
            }

            if (interaction.options.getSubcommand() === 'list') {
                await removeLotHandler(interaction);
            }
        }
    }

    if (process.env.PROFILES_MODULE) {
        if (interaction.commandName === 'profile') {
            if (interaction.options.getSubcommand() === 'view') {
                await handleProfileView(interaction, false, false);
            }

            if (interaction.options.getSubcommand() === 'edit') {
                await handleProfileEdit(interaction);
            }

            if (interaction.options.getSubcommand() === 'fill') {
                await handleProfileFill(interaction);
            }
        }

        if (interaction.commandName === "Просмотреть профиль игрока") {
            await handleProfileView(interaction, true, interaction.isMessageContextMenuCommand());
        }
    }

    if (process.env.RANDOM_GAMES_MODULE) {
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
    }

    if (process.env.ACHIEVEMENTS_MODULE) {
        if (interaction.commandName === 'achievement_info') {
            await getAchievementInfo(interaction);
        }
    }

    if (process.env.CODEX_MODULE) {
        if (interaction.commandName === 'get_codex') {
            await handleGetCodex(interaction);
        }
    }

    if (process.env.MARKET_MODULE) {
        if (interaction.commandName === 'market') {
            await listLots(interaction);
        }
    }

    if (process.env.WHITE_BLACK_LIST_MODULE) {
        if (interaction.commandName === 'list_add') {
            await addToList(interaction);
        }

        if (interaction.commandName === 'list_remove') {
            await removeFromList(interaction);
        }

        if (interaction.commandName === 'list_check') {
            await checkListStatus(interaction);
        }
    }
}