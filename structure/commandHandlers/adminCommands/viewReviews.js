import { MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { formatDate } from '../../utils.js';
import updateRatings from "../../updateRatings.js";

export default async function viewReviews(interaction, pool) {
    const member = interaction.options.getUser('user');

    const reviews = await pool.query(
        'SELECT id, reviewer_id, review_text, is_positive, timestamp FROM reviews WHERE target_user = $1 ORDER BY timestamp DESC LIMIT 10',
        [member.id]
    );

    if (reviews.rows.length === 0) {
        return interaction.reply({ content: `❌ У **${member.username}** пока нет отзывов.`, flags: MessageFlags.Ephemeral });
    }

    let message = `📋 **Отзывы о ${member.username}:**\n\n`;
    let buttons = new ActionRowBuilder();

    reviews.rows.forEach((review, index) => {
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text}" *(${formatDate(review.timestamp)})* \n`;

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`delete_review_${review.id}_${member.id}_1`)
                .setLabel(`Удалить ${index + 1}`)
                .setStyle(ButtonStyle.Danger)
        );
    });

    await updateRatings(pool);
    
    await interaction.reply({ content: message, components: [buttons], flags: MessageFlags.Ephemeral });
}
