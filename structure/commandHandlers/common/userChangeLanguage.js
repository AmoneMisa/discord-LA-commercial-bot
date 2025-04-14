import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

export default async function (interaction) {
    const lang = interaction.options.getString("language"); // en, ru и т.д.
    const userId = interaction.user.id;

    await pool.query("UPDATE users SET language = $1 WHERE user_id = $2", [lang, userId]);

    await interaction.reply({ content: await translatedMessage(interaction, "info.languageUpdated"), flags: MessageFlags.Ephemeral });
}