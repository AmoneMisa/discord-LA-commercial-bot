import { MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { formatDate } from '../../utils.js';
import updateRatings from "../../updateRatings.js";
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Fetches and displays the latest reviews for a specified user from the database.
 *
 * @param {Object} interaction - The interaction object, representing the current command or event.
 * @param {Object} pool - The database connection pool used to query the reviews.
 * @return {Promise<void>} Resolves when the interaction response has been sent, or errors if an issue occurs during execution.
 */
export default async function viewReviews(interaction, pool) {
    const member = interaction.options.getUser('user');

    const reviews = await pool.query(
        'SELECT id, reviewer_id, review_text, is_positive, timestamp FROM reviews WHERE target_user = $1 ORDER BY timestamp DESC LIMIT 10',
        [member.id]
    );

    if (reviews.rows.length === 0) {
        return interaction.reply({ content: i18n.t("errors.userDontHaveReviews", {
                username: member.username,
                lng: await getUserLanguage(interaction.user.id, pool)
            }), flags: MessageFlags.Ephemeral });
    }

    let message = i18n.t("info.reviewsAboutUser", {
        memberId: member.id,
        page: 1,
        lng: await getUserLanguage(interaction.user.id, pool)
    });
    let buttons = new ActionRowBuilder();

    for (const review of reviews.rows) {
        const index = reviews.rows.indexOf(review);
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text}" *(${formatDate(review.timestamp)})* \n`;

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`delete_review_${review.id}_${member.id}_1`)
                .setLabel(i18n.t("buttons.delete", {
                    index: index + 1,
                    lng: await getUserLanguage(interaction.user.id, pool)
                }))
                .setStyle(ButtonStyle.Danger)
        );
    }

    await updateRatings(pool);
    
    await interaction.reply({ content: message, components: [buttons], flags: MessageFlags.Ephemeral });
}
