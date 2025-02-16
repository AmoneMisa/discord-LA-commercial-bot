import handleInfoCommand from "../commandHandlers/ranks/handleInfoCommand.js";
import lastPositiveReviewsCommand from "../commandHandlers/ranks/lastPositiveReviewsCommand.js";
import lastNegativeReviewsCommand from "../commandHandlers/ranks/lastNegativeReviewsCommand.js";
import lastReviewsCommand from "../commandHandlers/ranks/lastReviewsCommand.js";
import handleAdminSettingsCommand from "../commandHandlers/handleAdminSettingsCommand.js";
import worstSellers from "../commandHandlers/ranks/worstSellers.js";
import subscribeToBuy from "../commandHandlers/subscribe/subscribeToBuy.js";
import subscribeList from "../commandHandlers/subscribe/subscribeList.js";

export default async function (interaction, pool) {
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

    if ((interaction.commandName === 'admin_settings'
            || interaction.commandName === 'admin_settings_subscription'
            || interaction.commandName === 'admin_settings_ranks')
        && interaction.options.getSubcommand() !== 'remove_bots') {
        await handleAdminSettingsCommand(interaction, pool, interaction.guild);
    }

    if (interaction.commandName === 'worst_sellers') {
        await worstSellers(interaction, pool);
    }

    if (interaction.commandName === 'subscribe') {
        if (interaction.options.getSubcommand() === 'to_buy') {
            await subscribeToBuy(interaction, pool);
        }

        if (interaction.options.getSubcommand() === 'list') {
            await subscribeList(interaction, pool);
        }
    }
}