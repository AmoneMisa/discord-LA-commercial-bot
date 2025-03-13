import {getMember, sendPaginatedReviews} from "../../utils.js";
import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Handles the "last reviews" command by fetching and displaying paginated reviews for a specific member.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} pool - The database connection pool used for querying member reviews.
 * @param {boolean} [isContextMenu=false] - Indicates whether the command is invoked through a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates whether the command is invoked through a message content menu command.
 * @return {Promise<void>} Resolves when the command processing is complete.
 */
export default async function handleLastReviewsCommand(interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (!member) return interaction.reply({ content: i18n.t("errors.incorrectMember", { lng: lang}), flags: MessageFlags.Ephemeral });

    if (member.bot) {
        return await interaction.reply({content: i18n.t("errors.userIsBot", { lng: lang}), flags: MessageFlags.Ephemeral});
    }

    await sendPaginatedReviews(interaction, pool,1, null, member.id);
}