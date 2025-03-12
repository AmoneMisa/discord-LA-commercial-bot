import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import i18n from "../../../locales/i18n.js";
import {getUserLanguage} from "../../dbUtils.js";

/**
 * Displays a modal for the user to leave a review based on the specified action.
 *
 * @param {object} interaction - The interaction object representing the user interaction with the bot.
 * @param pool
 * @param {string} action - The type of review action, either 'upvote' or 'downvote'.
 * @param {string} userId - The ID of the user for whom the review is being left.
 * @return {Promise<void>} A promise that resolves once the review modal has been displayed to the user.
 */
export default async function showReviewModal(interaction, pool, action, userId) {
    const lang = await getUserLanguage(interaction.user.id, pool);
    const modal = new ModalBuilder()
        .setCustomId(`review_${action}_${userId}`)
        .setTitle(action === 'upvote' ? i18n.t("buttons.leavePositiveReview", {lng: lang}) : i18n.t("buttons.leaveNegativeReview", {lng: lang}));

    const input = new TextInputBuilder()
        .setCustomId('review_text')
        .setLabel(i18n.t("buttons.fillReviewTitle", {lng: lang}))
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(i18n.t("buttons.fillReviewText", {lng: lang}))
        .setMinLength(10)
        .setMaxLength(300)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}
