import {getMember, sendPaginatedReviews, translatedMessage} from "../../utils.js";
import {MessageFlags} from "discord.js";

/**
 * Handles the "last negative reviews" command by displaying paginated reviews for a specific member.
 * It fetches reviews associated with the provided member and ensures proper interaction response.
 *
 * @param {Object} interaction - The command interaction object received from Discord API.
 * @param {boolean} [isContextMenu=false] - Specifies if the command is triggered from a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Specifies if the command is triggered from a message content menu.
 * @return {Promise<void>} Resolves with no return value after processing the interaction and sending the reviews.
 */
export default async function handleLastNegativeReviewsCommand(interaction, isContextMenu = false, isMessageContentMenuCommand = false) {
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

    await sendPaginatedReviews(interaction, 1, false, member.id);
}