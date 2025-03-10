import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";

export default async function (interaction, pool) {
    const channel = interaction.options.getChannel("channel");

    await pool.query("UPDATE settings SET value = $1 WHERE key = 'bet_info_private_channel_id'", [channel.id]);
    return await interaction.reply({ content: i18n.t("info.betChannelSet", { channelId: channel.id, lng: interaction.client.language[interaction.user.id] }), flags: MessageFlags.Ephemeral });
}
