import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

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
