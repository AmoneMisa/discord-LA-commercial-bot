import { MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { formatDate } from '../../utils.js';

export default async function viewReviews(interaction, pool) {
    const member = interaction.options.getUser('user');
    const page = interaction.options.getInteger('page') || 1;
    const reviewsPerPage = 10;
    const offset = (page - 1) * reviewsPerPage;

    const reviews = await pool.query(
        'SELECT id, reviewer_id, review_text, is_positive, "timestamp" FROM reviews WHERE target_user = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
        [member.id, reviewsPerPage, offset]
    );

    if (reviews.rows.length === 0) {
        return interaction.reply({ content: `❌ У **${member.username}** пока нет отзывов.`, flags: MessageFlags.Ephemeral });
    }

    let message = `📋 **Последние отзывы о ${member.username}:**\n\n`;
    reviews.rows.forEach((review, index) => {
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text}" *(${formatDate(review.timestamp)})* \n`;
    });

    const buttons = new ActionRowBuilder();
    if (offset > 0) buttons.addComponents(new ButtonBuilder().setCustomId(`prev_reviews_${member.id}_${page - 1}`).setLabel('⬅️ Назад').setStyle(ButtonStyle.Secondary));
    if (reviews.rows.length === reviewsPerPage) buttons.addComponents(new ButtonBuilder().setCustomId(`next_reviews_${member.id}_${page + 1}`).setLabel('➡️ Вперёд').setStyle(ButtonStyle.Secondary));

    await interaction.reply({ content: message, components: buttons.components.length ? [buttons] : [], flags: MessageFlags.Ephemeral });
}
