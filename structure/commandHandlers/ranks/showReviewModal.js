import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

/**
 * Displays a modal for the user to leave a review based on the specified action.
 *
 * @param {object} interaction - The interaction object representing the user interaction with the bot.
 * @param {string} action - The type of review action, either 'upvote' or 'downvote'.
 * @param {string} userId - The ID of the user for whom the review is being left.
 * @return {Promise<void>} A promise that resolves once the review modal has been displayed to the user.
 */
export default async function showReviewModal(interaction, action, userId) {
    const modal = new ModalBuilder()
        .setCustomId(`review_${action}_${userId}`)
        .setTitle(action === 'upvote' ? 'Оставить положительный отзыв' : 'Оставить отрицательный отзыв');

    const input = new TextInputBuilder()
        .setCustomId('review_text')
        .setLabel('Введите ваш отзыв')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Напишите здесь свой отзыв')
        .setMinLength(10)
        .setMaxLength(300)
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}
