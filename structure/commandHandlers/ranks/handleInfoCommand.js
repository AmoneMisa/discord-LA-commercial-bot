import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {formatDate} from "../../utils.js";
import dotenv from 'dotenv';
dotenv.config();

export default async function (interaction, pool) {
    const member = interaction.options.getUser('member');
    if (!member) return interaction.reply({ content: 'Выберите участника.', flags: MessageFlags.Ephemeral });

    const userStats = await pool.query('SELECT * FROM users WHERE user_id = $1', [member.id]);
    let userData = userStats.rows[0];

    if (!userData) {
        userData = { user_id: member.id, rating: 0, positive_reviews: 0, negative_reviews: 0 };
        await pool.query('INSERT INTO users (user_id, rating, positive_reviews, negative_reviews) VALUES ($1, $2, $3, $4)',
            [member.id, 0, 0, 0]);
    }

    const userRoleData = await pool.query(`
        SELECT role_name FROM roles 
        WHERE required_rating <= $1 
        AND min_reviews <= $2 
        AND min_positive_reviews <= $3
        ORDER BY required_rating DESC
        LIMIT 1
    `, [userData.rating, userData.positive_reviews + userData.negative_reviews, userData.positive_reviews]);

    const userRole = userRoleData.rows.length > 0 ? userRoleData.rows[0].role_name : "Без роли";

    const lastReviews = await pool.query(
        'SELECT is_positive, MAX("timestamp") AS last_review_time FROM reviews WHERE target_user = $1 GROUP BY is_positive',
        [member.id]
    );

    let lastPositiveReview = 'Нет данных';
    let lastNegativeReview = 'Нет данных';

    lastReviews.rows.forEach(review => {
        if (review.is_positive) lastPositiveReview = formatDate(review.last_review_time);
        else lastNegativeReview = formatDate(review.last_review_time);
    });

    const message = `:point_right: **${member.username} - ${userRole}**\n:chart_with_upwards_trend: Рейтинг: ${userData.rating}\n:white_check_mark: Положительные отзывы: ${userData.positive_reviews}\n:x: Отрицательные отзывы: ${userData.negative_reviews}\nПоследний положительный отзыв: ${lastPositiveReview}\nПоследний отрицательный отзыв: ${lastNegativeReview}`;

    const upvoteButton = new ButtonBuilder()
        .setCustomId(`upvote_${member.id}`)
        .setLabel('↑')
        .setStyle(ButtonStyle.Success);

    const downvoteButton = new ButtonBuilder()
        .setCustomId(`downvote_${member.id}`)
        .setLabel('↓')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(upvoteButton, downvoteButton);

    await interaction.reply({ content: message, components: [row], flags: MessageFlags.Ephemeral });
}