import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from 'discord.js';
import {formatDate, translatedMessage} from '../../utils.js';
import updateRatings from "../../updateRatings.js";

/**
 * Fetches and displays the latest reviews for a specified user from the database.
 *
 * @param {Object} interaction - The interaction object, representing the current command or event.
 * @return {Promise<void>} Resolves when the interaction response has been sent, or errors if an issue occurs during execution.
 */
export default async function viewReviews(interaction) {
    const member = interaction.options.getUser('user');

    const reviews = await pool.query(
        'SELECT id, reviewer_id, review_text, is_positive, timestamp FROM reviews WHERE target_user = $1 ORDER BY timestamp DESC LIMIT 10',
        [member.id]
    );

    if (reviews.rows.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.userDontHaveReviews", {username: member.username}),
            flags: MessageFlags.Ephemeral
        });
    }

    let message = await translatedMessage(interaction, "info.reviewsAboutUser", {username: member.username});
    let buttons = new ActionRowBuilder();

    for (const review of reviews.rows) {
        const index = reviews.rows.indexOf(review);
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text}" *(${formatDate(review.timestamp)})* \n`;

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`delete_review_${review.id}_${member.id}_1`)
                .setLabel(await translatedMessage(interaction, "buttons.delete", {index: index + 1}))
                .setStyle(ButtonStyle.Danger)
        );
    }

    await updateRatings();

    await interaction.reply({content: message, components: [buttons], flags: MessageFlags.Ephemeral});
}
