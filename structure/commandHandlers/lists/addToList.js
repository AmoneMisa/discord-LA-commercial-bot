import {MessageFlags} from "discord.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

export default async function(interaction, pool) {
    const target = interaction.options.getUser('target'); // Целевой игрок
    const listType = interaction.options.getString('type'); // whitelist или blacklist
    const role = interaction.options.getString('role'); // driver или buyer
    const userId = interaction.user.id;
    const targetId = target.id;
    const lang = await getUserLanguage(userId, pool);

    if (userId === targetId) {
        return interaction.reply({
            content: i18n.t("errors.cannotSelfAssign", { lng: lang }),
            flags: MessageFlags.Ephemeral
        });
    }

    // Проверяем, есть ли игрок в другом списке
    const existing = await pool.query(
        `SELECT * FROM whitelist_blacklist WHERE user_id = $1 AND target_id = $2`,
        [userId, targetId]
    );

    if (existing.rows.length > 0) {
        if (existing.rows[0].type === listType) {
            return interaction.reply({
                content: i18n.t("errors.alreadyInList", { lng: lang, type: i18n.t(`lists.${listType}`, { lng: lang }) }),
                flags: MessageFlags.Ephemeral
            });
        } else {
            // Если игрок есть в другом списке — обновляем запись
            await pool.query(
                `UPDATE whitelist_blacklist SET type = $1, role = $2, created_at = NOW() WHERE user_id = $3 AND target_id = $4`,
                [listType, role, userId, targetId]
            );
            return interaction.reply({
                content: i18n.t("info.movedToList", {
                    lng: lang,
                    type: i18n.t(`lists.${listType}`, { lng: lang }),
                    role: i18n.t(`roles.${role}`, { lng: lang })
                }),
                flags: MessageFlags.Ephemeral
            });
        }
    }

    // Добавляем игрока в список
    await pool.query(
        `INSERT INTO whitelist_blacklist (user_id, target_id, type, role) VALUES ($1, $2, $3, $4)`,
        [userId, targetId, listType, role]
    );

    return interaction.reply({
        content: i18n.t("info.addedToList", {
            lng: lang,
            username: target.username,
            type: i18n.t(`lists.${listType}`, { lng: lang }),
            role: i18n.t(`roles.${role}`, { lng: lang })
        }),
        flags: MessageFlags.Ephemeral
    });
}
