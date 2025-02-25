import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";
import {formatDate, getMember} from "../../utils.js";

/**
 * Handles an interaction, processes a user's data from the database,
 * and responds with their status and review statistics.
 * Optionally allows context menu commands to fetch user data.
 *
 * @param {Object} interaction - The interaction object from the Discord API.
 * @param {Object} pool - The PostgreSQL connection pool for executing database queries.
 * @param {boolean} [isContextMenu=false] - Indicates if the command is triggered from a context menu.
 * @param {boolean} [isMessageContentMenuCommand=false] - Indicates if the command is triggered on a message's content in a context menu.
 * @returns {Promise<void>} Resolves upon successfully sending a reply to the interaction.
 * @throws Will throw an error if database operations fail or interaction.reply fails.
 *
 * Database queries:
 * - Fetches user statistics (rating, positive reviews, negative reviews).
 * - Inserts default user data into the database if the user is not found.
 * - Fetches the user's corresponding role based on their rating and reviews.
 * - Retrieves the timestamps of the user's last positive and negative reviews.
 *
 * Interaction Reply Content:
 * - Includes a formatted message showing the user's username, role, rating, review counts, and timestamps of the last reviews.
 * - Provides buttons to upvote or downvote the user.
 *
 * Edge Cases:
 * - Replies with an ephemeral message if the user is a bot or not found in the system.
 * - Defaults to "Нет данных" for missing review information.
 */
export default async function (interaction, pool, isContextMenu = false, isMessageContentMenuCommand = false) {
    let member = getMember(interaction, isContextMenu, isMessageContentMenuCommand);

    if (!member) {
        return await interaction.reply({ content: 'Пользователь не выбран или не найден', flags: MessageFlags.Ephemeral });
    }

    if (member.bot) {
        return await interaction.reply({content: "Эту команду нельзя применять на ботах", flags: MessageFlags.Ephemeral});
    }

    const userStats = await pool.query('SELECT * FROM users WHERE user_id = $1', [member.id]);
    let userData = userStats.rows[0];

    if (!userData) {
        userData = { user_id: member.id, rating: 0, positive_reviews: 0, negative_reviews: 0 };
        await pool.query('INSERT INTO users (user_id, rating, positive_reviews, negative_reviews) VALUES ($1, $2, $3, $4)',
            [member.id, 0, 0, 0]);
    }

    const userRoleData = await pool.query(`
        SELECT role_name FROM roles 
        WHERE required_rating::REAL <= $1 
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