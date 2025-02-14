import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionsBitField} from "discord.js";

export function formatDate(dateString) {
    if (!dateString) return 'Нет данных';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export async function sendPaginatedReviews(interaction, pool, userId, page = 1) {
    const reviewsPerPage = 5;
    const offset = (page - 1) * reviewsPerPage;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

    const reviews = await pool.query(
        'SELECT id, reviewer_id, review_text, is_positive, timestamp FROM reviews WHERE target_user = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
        [userId, reviewsPerPage, offset]
    );

    if (reviews.rows.length === 0) {
        return interaction.reply({
            content: `❌ У пользователя <@${userId}> пока нет отзывов.`,
            flags: MessageFlags.Ephemeral
        });
    }

    let message = `📋 **Отзывы о <@${userId}> (Страница ${page}):**\n\n`;
    let buttons = new ActionRowBuilder();

    reviews.rows.forEach((review, index) => {
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text}" *(${formatDate(review.timestamp)})* \n`;

        if (isAdmin) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_review_${review.id}_${userId}_${page}`)
                    .setLabel(`Удалить ${index + 1}`)
                    .setStyle(ButtonStyle.Danger)
            );
            console.log(buttons)
        }
    });

    const totalReviews = await pool.query('SELECT COUNT(*) FROM reviews WHERE target_user = $1', [userId]);
    const totalPages = Math.ceil(parseInt(totalReviews.rows[0].count) / reviewsPerPage);

    let paginationButtons = new ActionRowBuilder();
    if (page > 1) {
        paginationButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`prev_reviews_${userId}_${page - 1}`)
                .setLabel('⬅️ Назад')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    if (page < totalPages) {
        paginationButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`next_reviews_${userId}_${page + 1}`)
                .setLabel('➡️ Вперёд')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    await interaction.reply({
        content: message,
        components: paginationButtons.components.length > 0
            ? isAdmin ? [buttons, paginationButtons] : [paginationButtons]
            : isAdmin ? [buttons] : [],
        flags: MessageFlags.Ephemeral
    });
}

export function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}