import { MessageFlags } from 'discord.js';
import { setLeaderboardChannelId } from '../../dbUtils.js';
import updateLeaderboard from '../updateLeaderboard.js';
import i18n from "../../../locales/i18n.js";

/**
 * Sets the leaderboard channel for the interaction. Validates user permissions
 * and ensures the specified channel is a valid text channel before updating the
 * leaderboard configuration and refreshing the leaderboard.
 *
 * @param {Object} interaction - The interaction object containing command details and user context.
 * @param {Object} pool - The database connection pool used to store and retrieve data.
 * @param {Object} client - The client instance of the bot, used for further operations such as updating the leaderboard.
 * @return {Promise<void>} Resolves when the leaderboard channel is successfully set and the leaderboard is updated.
 */
export default async function setLeaderboardChannel(interaction, pool, client) {
    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
            content: i18n.t("errors.notAdmin", { lng: interaction.client.language[interaction.user.id]}),
            flags: MessageFlags.Ephemeral
        });
    }

    const channel = interaction.options.getChannel('channel');

    if (!channel) {
        return interaction.reply({
            content: i18n.t("errors.channelDoesntChoose", { lng: interaction.client.language[interaction.user.id]}),
            flags: MessageFlags.Ephemeral
        });
    }

    if (channel.type !== 0) { // 0 = текстовый канал
        return interaction.reply({
            content: i18n.t("errors.channelMustBeTextType", { lng: interaction.client.language[interaction.user.id]}),
            flags: MessageFlags.Ephemeral
        });
    }

    await setLeaderboardChannelId(pool, channel.id);

    await interaction.reply({
        content: i18n.t("info.setLeaderboardChannel", { lng: interaction.client.language[interaction.user.id], channelId: channel.id}),
        flags: MessageFlags.Ephemeral
    });

    await updateLeaderboard(client, pool);
}
