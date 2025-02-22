import {MessageFlags} from "discord.js";
import showReviewModal from "./showReviewModal.js";

/**
 * Handles an interaction event for submitting or managing reviews.
 *
 * This function processes an interaction related to reviews, performing multiple checks and actions:
 * - Splits and retrieves the action type and target user ID from the interaction's custom ID.
 * - Verifies if the reviewer user is blocked from submitting reviews.
 * - Checks if the target user is blocked from receiving reviews.
 * - Implements cooldown restrictions if enabled, preventing review spam for the same user within a configured time window.
 * - Ensures users are not allowed to review themselves unless self-voting is explicitly permitted.
 * - Finally, invokes a modal to proceed with the review submission if all conditions are satisfied.
 *
 * @param {Interaction} interaction - The interaction object containing the review action and user details.
 * @param {Pool} pool - The database connection pool to query necessary data.
 *
 * @async
 * @throws Will reply to the interaction with an appropriate error message if any condition (e.g., blocked user, cooldown, self-voting restriction) is violated.
 */
export default async function(interaction, pool) {
    const [action, userId] = interaction.customId.split('_');
    const reviewerId = interaction.user.id;

    const blockedReviewer = await pool.query('SELECT * FROM blocked_reviewers WHERE user_id = $1', [reviewerId]);
    if (blockedReviewer.rows.length > 0) {
        return interaction.reply({
            content: '🚫 Вы не можете оставлять отзывы, так как вам это запрещено.',
            flags: MessageFlags.Ephemeral
        });
    }

    const blockedReceiver = await pool.query('SELECT * FROM blocked_receivers WHERE user_id = $1', [userId]);
    if (blockedReceiver.rows.length > 0) {
        return interaction.reply({
            content: `🚫 Этот пользователь не может получать отзывы.`,
            flags: MessageFlags.Ephemeral
        });
    }

    const cooldownSetting = await pool.query('SELECT value FROM settings WHERE key = \'cooldown_enabled\'');
    const cooldownMinutes = await pool.query('SELECT value FROM settings WHERE key = \'cooldown_minutes\'');

    const cooldownTime = parseInt(cooldownMinutes.rows[0]?.value || process.env.REVIEW_COOLDOWN_MINUTES) * 60 * 1000;
    const cooldownEnabled = cooldownSetting.rows[0]?.value === 'true';

    if (cooldownEnabled) {
        const lastReview = await pool.query(
            'SELECT "timestamp" FROM reviews WHERE reviewer_id = $1 AND target_user = $2 ORDER BY "timestamp" DESC LIMIT 1',
            [reviewerId, userId]
        );

        if (lastReview.rows.length > 0) {
            const lastReviewTime = new Date(lastReview.rows[0].timestamp);
            const timePassed = Date.now() - lastReviewTime.getTime();

            if (timePassed < cooldownTime) {
                const remainingTime = Math.ceil((cooldownTime - timePassed) / 60000);
                return interaction.reply({
                    content: `⏳ Вы уже оставили отзыв этому пользователю недавно. Попробуйте снова через **${remainingTime} минут**.`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }

    const allowSelfVoting = await pool.query('SELECT value FROM settings WHERE key = \'allow_self_voting\'');
    const selfVotingEnabled = allowSelfVoting.rows.length > 0 ? allowSelfVoting.rows[0].value === 'true' : false;

    if (userId.toString() === reviewerId.toString() && !selfVotingEnabled) {
        return interaction.reply({
            content: '❌ Вы не можете оставлять отзыв самому себе.',
            flags: MessageFlags.Ephemeral
        });
    }

    await showReviewModal(interaction, action, userId);
}