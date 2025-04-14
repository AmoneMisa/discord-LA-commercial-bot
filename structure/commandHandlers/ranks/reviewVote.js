import {MessageFlags} from "discord.js";
import showReviewModal from "./showReviewModal.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles an interaction event for submitting or managing reviews.
 *
 * @param {Object} interaction - The interaction object containing the review action and user details.
 * @async
 */
export default async function (interaction) {
    const [action, userId] = interaction.customId.split('_');
    const reviewerId = interaction.user.id;

    const blockedReviewer = await pool.query('SELECT * FROM blocked_reviewers WHERE user_id = $1', [reviewerId]);

    if (blockedReviewer.rows.length > 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.blockedReviewer"),
            flags: MessageFlags.Ephemeral
        });
    }

    const blockedReceiver = await pool.query('SELECT * FROM blocked_receivers WHERE user_id = $1', [userId]);

    if (blockedReceiver.rows.length > 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.blockedReceiver"),
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
                    content: await translatedMessage(interaction, "errors.reviewCooldown", {time: remainingTime}),
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }

    const allowSelfVoting = await pool.query('SELECT value FROM settings WHERE key = \'allow_self_voting\'');
    const selfVotingEnabled = allowSelfVoting.rows.length > 0 ? allowSelfVoting.rows[0].value === 'true' : false;

    if (userId.toString() === reviewerId.toString() && !selfVotingEnabled) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.selfReview"),
            flags: MessageFlags.Ephemeral
        });
    }

    await showReviewModal(interaction, action, userId);
}