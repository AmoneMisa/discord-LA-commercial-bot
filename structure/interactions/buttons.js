import {MessageFlags} from "discord.js";
import showReviewModal from "../commandHandlers/ranks/showReviewModal.js";
import {sendPaginatedReviews} from "../utils.js";
import deleteReview from "../commandHandlers/ranks/deleteReview.js";
import handleEditRaidsButtons from "../commandHandlers/subscribe/handleEditRaidsButtons.js";
import handleBuyButtons from "../commandHandlers/subscribe/handleBuyButtons.js";
import sellerAnswerToBuyer from "../commandHandlers/subscribe/sellerAnswerToBuyer.js";

export default async function (interaction, pool, client) {
    if (interaction.customId.startsWith('upvote_') || interaction.customId.startsWith('downvote_')) {
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

    if (interaction.customId.startsWith('prev_reviews_') || interaction.customId.startsWith('next_reviews_')) {
        const [, userId, page] = interaction.customId.split('_');
        await sendPaginatedReviews(interaction, pool, userId, parseInt(page));
    }

    if (interaction.customId.startsWith('delete_review_')) {
        deleteReview(interaction, pool);
    }

    if (interaction.customId === 'create_raid' || interaction.customId.startsWith('delete_raid')) {
        handleEditRaidsButtons(interaction, pool);
    }

    if (interaction.customId.startsWith('raid_buy')) {
        handleBuyButtons(interaction);
    }

    if (interaction.customId.startsWith('seller_answer_') || interaction.customId.startsWith('seller_reject_')) {
        sellerAnswerToBuyer(interaction, pool, client);
    }
}