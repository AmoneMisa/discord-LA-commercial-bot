import {getUserLanguage} from "../../dbUtils.js";
import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";

export default async function(interaction, pool) {
    const target = interaction.options.getUser('target'); // Целевой игрок
    const targetId = target.id;
    const userId = interaction.user.id;
    const lang = await getUserLanguage(userId, pool);

    const result = await pool.query(
        `SELECT type, role FROM whitelist_blacklist WHERE user_id = $1 AND target_id = $2`,
        [userId, targetId]
    );

    if (result.rows.length === 0) {
        return interaction.reply({
            content: i18n.t("info.notInList", { lng: lang, username: target.username }),
            flags: MessageFlags.Ephemeral
        });
    }

    const { type, role } = result.rows[0];

    return interaction.reply({
        content: i18n.t("info.inList", {
            lng: lang,
            username: target.username,
            type: i18n.t(`lists.${type}`, { lng: lang }),
            role: i18n.t(`roles.${role}`, { lng: lang })
        }),
        flags: MessageFlags.Ephemeral
    });
}
