import { MessageFlags } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Removes bot accounts from the database based on the provided interaction and database connection pool.
 * Validates if the user has Administrator permissions before proceeding with the operation.
 * Deletes bot-related entries in the `reviews` and `users` tables.
 * Provides feedback to the user via the interaction.
 *
 * @param {Object} interaction - The interaction object representing the user's command in Discord.
 * @param {Object} pool - The database connection pool used for executing queries.
 * @return {Promise<void>} A promise resolved once the operation is completed or rejected in case of an error.
 */
export default async function removeBots(interaction, pool) {
    const lang = await getUserLanguage(interaction.user.id, pool);
    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
            content: i18n.t("errors.notAdmin", { lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        const bots = interaction.guild.members.cache.filter(member => member.user.bot);

        if (bots.size === 0) {
            return interaction.editReply({
                content: i18n.t("info.noBotsInDB", { lng: lang}),
                flags: MessageFlags.Ephemeral
            });
        }

        const botIds = bots.map(bot => bot.user.id);

        await pool.query(`DELETE FROM reviews WHERE reviewer_id = ANY($1) OR target_user = ANY($1)`, [botIds]);
        await pool.query(`DELETE FROM users WHERE user_id = ANY($1)`, [botIds]);

        await interaction.editReply({
            content: i18n.t("info.botsRemovedFromDB", { lng: lang, botsCount: botIds.length}),
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error(i18n.t("errors.deleteBotFromDB", { lng: lang}), error);
        await interaction.editReply({
            content: i18n.t("errors.deleteBotFromDB", { lng: lang}),
            flags: MessageFlags.Ephemeral
        });
    }
}
