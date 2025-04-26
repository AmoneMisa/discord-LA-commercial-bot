import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const channel = interaction.options.getChannel("channel");

    await pool.query(
        "UPDATE settings SET value = $1 WHERE key = 'bet_info_private_channel_id'",
        [channel.id]
    );

    return await interaction.reply({
        content: await translatedMessage(interaction, "info.betChannelSet", {channelId: channel.id}),
        flags: MessageFlags.Ephemeral
    });
}