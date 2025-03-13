import { MessageFlags } from 'discord.js';
import {getUserLanguage} from "../../dbUtils.js";
import i18n from "../../../locales/i18n.js";

/**
 * Updates the rank criteria for a specified role in the database and notifies the user about the changes.
 *
 * @param {Object} interaction - The interaction object containing command options and methods to interact with the user.
 * @param {Object} pool - The database connection pool used for executing queries.
 * @param {Object} pool.query - The function used to execute SQL queries within the pool.
 *
 * @return {Promise<void>} A Promise that resolves after the rank criteria is updated and the user has been notified.
 */
export default async function setRankCriteria(interaction, pool) {
    const roleName = interaction.options.getString('role_name');
    const requiredRating = Math.min(interaction.options.getInteger('required_rating'), 100);
    const minReviews = Math.min(interaction.options.getInteger('min_reviews'), 0);
    const minPositiveReviews = Math.min(interaction.options.getInteger('min_positive_reviews'), 0);
    const minNegativeReviews = Math.min(interaction.options.getInteger('min_negative_reviews'), 0);

    const role = await pool.query('SELECT * FROM roles WHERE role_name = $1', [roleName]);

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (role.rows.length === 0) {
        return interaction.reply({ content: i18n.t("errors.roleNotFound", { roleName, lng: lang }), flags: MessageFlags.Ephemeral });
    }

    await pool.query(`
        UPDATE roles SET
                         required_rating = $1,
                         min_reviews = $2,
                         min_positive_reviews = $3,
                         min_negative_reviews = $4
        WHERE role_name = $5
    `, [requiredRating, minReviews, minPositiveReviews, minNegativeReviews, roleName]);

    await interaction.reply({
        content: i18n.t("info.roleCriteriaUpdated", {
            roleName,
            requiredRating,
            minReviews,
            minPositiveReviews,
            minNegativeReviews,
            lng: lang
        }),
        flags: MessageFlags.Ephemeral
    });
}
