import { MessageFlags } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Retrieves and replies with the top 5 worst-rated sellers from the database within the last 30 days.
 *
 * @param {Object} interaction - The interaction object containing information about the command or event, used for replying to the user.
 * @param {Object} pool - The database pool used for querying worst-rated sellers based on recent reviews.
 * @return {Promise<void>} - Resolves when the response is sent to the user, either with the list of worst-rated sellers or a default message if none are found.
 */
export default async function worstSellers(interaction, pool) {
    const worstUsers = await pool.query(
        `SELECT user_id, rating, positive_reviews, negative_reviews
         FROM users
         WHERE user_id IN (SELECT DISTINCT target_user
                           FROM reviews
                           WHERE timestamp >= NOW() - INTERVAL '30 days')
         ORDER BY rating, negative_reviews DESC
         LIMIT 5`
    );

    if (worstUsers.rows.length === 0) {
        return interaction.reply({ content: i18n.t("info.noSellersWithRating", { lng: await getUserLanguage(interaction.user.id, pool)}), flags: MessageFlags.Ephemeral });
    }

    let message = i18n.t("info.topFiveWorstSellers", { lng: await getUserLanguage(interaction.user.id, pool)});
    for (const user of worstUsers.rows) {
        const index = worstUsers.rows.indexOf(user);
        message += i18n.t("info.negativeReviewsCountInfo", { lng: await getUserLanguage(interaction.user.id, pool), index: index + 1, userId: user.user_id, negativeReviews: user.negative_reviews, totalReviews: user.positive_reviews + user.negative_reviews });
    }

    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
}
