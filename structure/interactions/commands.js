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

export default async function (interaction, pool, client) {
    if (interaction.commandName === 'info') {
        await handleInfoCommand(interaction, pool);
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
        await pickRandom(interaction, pool);
    }

    if (interaction.commandName === 'random_number') {
        await randomNumber(interaction, pool);
    }

    if (interaction.commandName === 'roll_dice') {
        await rollDice(interaction, pool);
    }
}