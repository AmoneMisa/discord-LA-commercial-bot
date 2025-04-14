import {MessageFlags} from 'discord.js';
import {setLeaderboardChannelId} from '../../dbUtils.js';
import updateLeaderboard from '../updateLeaderboard.js';
import {translatedMessage} from "../../utils.js";

/**
 * Sets the leaderboard channel for the interaction. Validates user permissions
 * and ensures the specified channel is a valid text channel before updating the
 * leaderboard configuration and refreshing the leaderboard.
 *
 * @param {Object} interaction - The interaction object containing command details and user context.
 * @return {Promise<void>} Resolves when the leaderboard channel is successfully set and the leaderboard is updated.
 */
export default async function setLeaderboardChannel(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.notAdmin"),
            flags: MessageFlags.Ephemeral
        });
    }

    const channel = interaction.options.getChannel('channel');

    if (!channel) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.channelDoesntChoose"),
            flags: MessageFlags.Ephemeral
        });
    }

    if (channel.type !== 0) { // 0 = текстовый канал
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.channelMustBeTextType"),
            flags: MessageFlags.Ephemeral
        });
    }

    await setLeaderboardChannelId(channel.id);
    await interaction.reply({
        content: await translatedMessage(interaction, "info.setLeaderboardChannel", {channelId: channel.id}),
        flags: MessageFlags.Ephemeral
    });

    await updateLeaderboard();
}
