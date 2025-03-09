import {getMember, sendPaginatedReviews} from "../../utils.js";
import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";

/**
 * Handles an interaction to display paginated reviews for a specific user.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing command details and options.
 * @param {Object} pool - The database connection pool for querying data.
 * @param {boolean} [isContextMenu=false] - Indicates if the interaction was triggered as a context menu command.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates if the interaction was triggered as a message content menu command.
 * @returns {Promise<void>} Resolves when the action has been processed and a response is sent.
 */
export default async function (interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (!member) {
        return interaction.reply({content: 'Выберите участника.', flags: MessageFlags.Ephemeral});
    }

    if (member.bot) {
        return await interaction.reply({content: i18n.t("errors.userIsBot", { lng: interaction.client.language[interaction.user.id]}), flags: MessageFlags.Ephemeral});
    }


    await sendPaginatedReviews(interaction, pool,1, true, member.id);
}