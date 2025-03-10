import i18n from "../../../locales/i18n.js";

export default async function (interaction, pool) {
    const lang = interaction.options.getString("language"); // en, ru и т.д.
    const userId = interaction.user.id;

    await pool.query("UPDATE users SET language = $1 WHERE user_id = $2", [lang, userId]);

    const message = i18n.t("info.languageUpdated", { lang });
    await interaction.reply({ content: message });
}