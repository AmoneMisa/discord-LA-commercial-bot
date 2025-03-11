import handleInfoCommand from "../commandHandlers/ranks/handleInfoCommand.js";
import lastPositiveReviewsCommand from "../commandHandlers/ranks/lastPositiveReviewsCommand.js";
import lastNegativeReviewsCommand from "../commandHandlers/ranks/lastNegativeReviewsCommand.js";
import lastReviewsCommand from "../commandHandlers/ranks/lastReviewsCommand.js";
import handleAdminSettingsCommand from "../commandHandlers/handleAdminCommand.js";
import worstSellers from "../commandHandlers/ranks/worstSellers.js";
import reviewNotificationsToggle from "../commandHandlers/ranks/reviewNotificationsToggle.js";
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

    // обработчики команд контекстного меню
    if (interaction.commandName === "Получить инфо или оставить отзыв") {
        await handleInfoCommand(interaction, pool, true, interaction.isMessageContextMenuCommand());
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

    if (interaction.commandName === 'Изменить ставку') {
        await updateBetModal(interaction, pool);
    }
}