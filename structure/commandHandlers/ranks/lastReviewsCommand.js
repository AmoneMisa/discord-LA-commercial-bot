import {getMember, sendPaginatedReviews, translatedMessage} from "../../utils.js";
import {MessageFlags} from "discord.js";

/**
 * Handles the "last reviews" command by fetching and displaying paginated reviews for a specific member.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {boolean} [isContextMenu=false] - Indicates whether the command is invoked through a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates whether the command is invoked through a message content menu command.
 * @return {Promise<void>} Resolves when the command processing is complete.
 */
export default async function handleLastReviewsCommand(interaction, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (!member) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.incorrectMember"),
            flags: MessageFlags.Ephemeral
        });
    }

    if (member.bot) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.userIsBot"),
            flags: MessageFlags.Ephemeral
        });
    }

    await sendPaginatedReviews(interaction, 1, null, member.id);
}