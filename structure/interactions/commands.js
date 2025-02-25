import handleInfoCommand from "../commandHandlers/ranks/handleInfoCommand.js";
import lastPositiveReviewsCommand from "../commandHandlers/ranks/lastPositiveReviewsCommand.js";
import lastNegativeReviewsCommand from "../commandHandlers/ranks/lastNegativeReviewsCommand.js";
import lastReviewsCommand from "../commandHandlers/ranks/lastReviewsCommand.js";
import handleAdminSettingsCommand from "../commandHandlers/handleAdminSettingsCommand.js";
import worstSellers from "../commandHandlers/ranks/worstSellers.js";
import reviewNotificationsToggle from "../commandHandlers/ranks/reviewNotificationsToggle.js";

export default async function (interaction, pool) {
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

    if ((interaction.commandName === 'admin_settings'
            || interaction.commandName === 'admin_settings_subscription'
            || interaction.commandName === 'admin_settings_ranks')
        && interaction.options.getSubcommand() !== 'remove_bots') {
        await handleAdminSettingsCommand(interaction, pool, interaction.guild);
    }

    if (interaction.commandName === 'worst_sellers') {
        await worstSellers(interaction, pool);
    }

    if (interaction.commandName === 'review_notifications_toggle') {
        await reviewNotificationsToggle(interaction, pool);
    }

    if (interaction.commandName === "Получить инфо или оставить отзыв") {
        await handleInfoCommand(interaction, pool, true);
    }
}