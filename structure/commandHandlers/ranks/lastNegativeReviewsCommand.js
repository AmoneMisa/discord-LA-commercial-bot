import {getMember, sendPaginatedReviews} from "../../utils.js";
import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";

/**
 * Handles the "last negative reviews" command by displaying paginated reviews for a specific member.
 * It fetches reviews associated with the provided member and ensures proper interaction response.
 *
 * @param {Object} interaction - The command interaction object received from Discord API.
 * @param {Object} pool - The database connection pool for executing queries.
 * @param {boolean} [isContextMenu=false] - Specifies if the command is triggered from a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Specifies if the command is triggered from a message content menu.
 * @return {Promise<void>} Resolves with no return value after processing the interaction and sending the reviews.
 */
export default async function handleLastNegativeReviewsCommand(interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (!member) {
        return interaction.reply({ content: 'Выберите участника.', flags: MessageFlags.Ephemeral });
    }

    if (member.bot) {
        return await interaction.reply({content: i18n.t("errors.userIsBot", { lng: interaction.client.language[interaction.user.id]}), flags: MessageFlags.Ephemeral});
    }

    await sendPaginatedReviews(interaction, pool, 1, false, member.id);
}