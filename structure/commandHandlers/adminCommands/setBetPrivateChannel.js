import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function (interaction, pool) {
    const channel = interaction.options.getChannel("channel");

    await pool.query("UPDATE settings SET value = $1 WHERE key = 'bet_info_private_channel_id'", [channel.id]);
    return await interaction.reply({ content: i18n.t("info.betChannelSet", { channelId: channel.id, lng: await getUserLanguage(interaction.user.id, pool) }), flags: MessageFlags.Ephemeral });
}
