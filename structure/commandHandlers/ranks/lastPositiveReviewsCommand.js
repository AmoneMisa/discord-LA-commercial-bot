import {getMember, sendPaginatedReviews, translatedMessage} from "../../utils.js";
import {MessageFlags} from "discord.js";

/**
 * Handles an interaction to display paginated reviews for a specific user.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object containing command details and options.
 * @param {boolean} [isContextMenu=false] - Indicates if the interaction was triggered as a context menu command.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates if the interaction was triggered as a message content menu command.
 * @returns {Promise<void>} Resolves when the action has been processed and a response is sent.
 */
export default async function (interaction, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);
    await translatedMessage(interaction, "errors.userIsBot")

    if (!member) {
        return interaction.reply({content: await translatedMessage(interaction, "errors.incorrectMember"), flags: MessageFlags.Ephemeral});
    }

    if (member.bot) {
        return await interaction.reply({content: await translatedMessage(interaction, "errors.userIsBot"), flags: MessageFlags.Ephemeral});
    }


    await sendPaginatedReviews(interaction,1, true, member.id);
}