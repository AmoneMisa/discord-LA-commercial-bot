import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export async function removeFromList(interaction, pool) {
    const target = interaction.options.getUser('target'); // Целевой игрок
    const userId = interaction.user.id;
    const targetId = target.id;
    const lang = await getUserLanguage(userId, pool);

    const result = await pool.query(
        `DELETE FROM whitelist_blacklist WHERE user_id = $1 AND target_id = $2 RETURNING *`,
        [userId, targetId]
    );

    if (result.rowCount === 0) {
        return interaction.reply({
            content: i18n.t("errors.notInList", { lng: lang, username: target.username }),
            flags: MessageFlags.Ephemeral
        });
    }

    return interaction.reply({
        content: i18n.t("info.removedFromList", { lng: lang, username: target.username }),
        flags: MessageFlags.Ephemeral
    });
}
