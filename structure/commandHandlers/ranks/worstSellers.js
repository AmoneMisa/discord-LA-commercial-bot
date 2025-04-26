import {MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Retrieves and replies with the top 5 worst-rated sellers from the database within the last 30 days.
 *
 * @param {Object} interaction - The interaction object containing information about the command or event, used for replying to the user.
 * @return {Promise<void>} - Resolves when the response is sent to the user, either with the list of worst-rated sellers or a default message if none are found.
 */
export default async function worstSellers(interaction) {
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
        return interaction.reply({ content: await translatedMessage(interaction, "info.noSellersWithRating"), flags: MessageFlags.Ephemeral });
    }

    let message = await translatedMessage(interaction, "info.topFiveWorstSellers");
    for (const user of worstUsers.rows) {
        const index = worstUsers.rows.indexOf(user);
        message +=  await translatedMessage(interaction, "info.negativeReviewsCountInfo", {index: index + 1, userId: user.user_id, negativeReviews: user.negative_reviews, totalReviews: user.positive_reviews + user.negative_reviews});
    }

    await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
}
