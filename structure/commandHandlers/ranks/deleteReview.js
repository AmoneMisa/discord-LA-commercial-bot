import {MessageFlags, PermissionsBitField} from "discord.js";
import {sendPaginatedReviews, translatedMessage} from "../../utils.js";
import updateRatings from "../../updateRatings.js";

/**
 * Handles an interaction to delete a review from the database and updates the user's review statistics.
 *
 * This function performs the following steps:
 * 1. Parses the review ID and page number from the interaction's custom ID.
 * 2. Validates the parsed review ID and page number.
 * 3. Checks if the user has administrator permissions within the server to proceed.
 * 4. Fetches review data (e.g., positive or negative) from the database.
 * 5. Deletes the specified review from the database.
 * 6. Updates the user's positive or negative review count and recalculates the user's rating.
 * 7. Sends the updated list of paginated reviews back to the interaction.
 *
 * @async
 * @function
 * @param {Object} interaction - The interaction object that initiated the process.
 * @param {Object} interaction.guild - The guild object associated with the current interaction.
 * @param {Object} interaction.user - The user object that triggered the interaction.
 * @param {string} interaction.customId - The custom ID from the interaction, containing details for parsing.
 * @param {Function} interaction.reply - A method to send a reply to the interaction.
 * @throws {Error} Throws an error if database queries fail.
 */
export default async function (interaction) {
    const [, , reviewId, userId, page] = interaction.customId.split('_');
    const parsedReviewId = parseInt(reviewId);
    const parsedPage = parseInt(page);

    if (isNaN(parsedReviewId) || isNaN(parsedPage)) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.incorrectId"),
            flags: MessageFlags.Ephemeral
        });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!isAdmin) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.notAdmin"),
            flags: MessageFlags.Ephemeral
        });
    }

    const reviewData = await pool.query('SELECT is_positive FROM reviews WHERE id = $1', [parsedReviewId]);

    if (reviewData.rows.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.reviewDontFound"),
            flags: MessageFlags.Ephemeral
        });
    }

    const isPositive = reviewData.rows[0].is_positive;

    await pool.query('DELETE FROM reviews WHERE id = $1', [parsedReviewId]);

    if (isPositive) {
        await pool.query('UPDATE users SET positive_reviews = positive_reviews - 1 WHERE user_id = $1 AND positive_reviews > 0', [userId]);
    } else {
        await pool.query('UPDATE users SET negative_reviews = negative_reviews - 1 WHERE user_id = $1 AND negative_reviews > 0', [userId]);
    }

    await updateRatings();

    await sendPaginatedReviews(interaction, parsedPage, isPositive || null, userId);
}