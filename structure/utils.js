import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    PermissionsBitField,
    TextInputStyle
} from "discord.js";

/**
 * Formats a date string into the format "DD/MM/YYYY HH:mm".
 * If the input date string is invalid or not provided, returns "Нет данных".
 *
 * @param {string} dateString - The input date string to be formatted.
 * @return {string} The formatted date string in "DD/MM/YYYY HH:mm" format, or "Нет данных" if the input is invalid.
 */
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

/**
 * Sends a paginated list of reviews for a specific user to the interaction.
 * Allows filtering by positive or negative reviews and includes pagination buttons for navigation.
 * If the interaction author has administrative permissions, delete buttons for each review are generated.
 *
 * @param {Object} interaction - The interaction object representing the user interaction.
 * @param {Object} pool - The database connection pool to execute SQL queries.
 * @param {number} [page=1] - The current page number for pagination. Defaults to 1.
 * @param {boolean} [isPositive] - If true, fetches only positive reviews. If false, fetches only negative reviews. Fetches all reviews if not specified.
 * @param {string} memberId - The ID of the member whose reviews are being fetched.
 * @return {Promise<void>} A promise that resolves when the paginated reviews are sent to the interaction.
 */
export async function sendPaginatedReviews(interaction, pool, page = 1, isPositive, memberId) {
    const reviewsPerPage = 5;
    const offset = (page - 1) * reviewsPerPage;
    const member = await interaction.guild.members.fetch(memberId);
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

    let reviews;

    if (isPositive === true) {
        reviews = await pool.query(
            'SELECT id, reviewer_id, review_text, is_positive, "timestamp" FROM reviews WHERE target_user = $1 AND is_positive = true ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
            [member.id, reviewsPerPage, offset]
        );
    } else if (isPositive === false) {
        reviews = await pool.query(
            'SELECT id, reviewer_id, review_text, is_positive, "timestamp" FROM reviews WHERE target_user = $1 AND is_positive = false ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
            [member.id, reviewsPerPage, offset]
        );
    } else {
        reviews = await pool.query(
            'SELECT id, reviewer_id, review_text, is_positive, "timestamp" FROM reviews WHERE target_user = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
            [member.id, reviewsPerPage, offset]
        );
    }

    if (reviews.rows.length === 0) {
        return interaction.reply({
            content: `❌ У пользователя <@${member.id}> пока нет отзывов.`,
            flags: MessageFlags.Ephemeral
        });
    }

    let message = `📋 **Отзывы о <@${member.id}> (Страница ${page}):**\n\n`;
    let buttons = new ActionRowBuilder();

    reviews.rows.forEach((review, index) => {
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text.subStr(0, 300)}" *(${formatDate(review.timestamp)})* \n`;

        if (isAdmin) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_review_${review.id}_${member.id}_${page}`)
                    .setLabel(`Удалить ${index + 1}`)
                    .setStyle(ButtonStyle.Danger)
            );
        }
    });

    const totalReviews = await pool.query('SELECT COUNT(*) FROM reviews WHERE target_user = $1', [member.id]);
    const totalPages = Math.ceil(parseInt(totalReviews.rows[0].count) / reviewsPerPage);

    let paginationButtons = new ActionRowBuilder();
    if (page > 1) {
        paginationButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`prev_reviews_${member.id}_${page - 1}_${isPositive}`)
                .setLabel('⬅️ Назад')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    if (page < totalPages) {
        paginationButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`next_reviews_${member.id}_${page + 1}_${isPositive}`)
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
/**
 * Retrieves a member or user based on the provided parameters and interaction context.
 *
 * @param {Object} interaction - The interaction object containing the context and options.
 * @param {boolean} isContextMenu - Indicates whether the command is triggered from a context menu.
 * @param {boolean} isMessageContentMenuCommand - Indicates whether the context menu is targeting message content.
 * @param {string} [getType='member'] - Specifies the type of entity to retrieve ("user" or "member").
 * @return {Object} The retrieved user or member object, determined by the interaction context and parameters.
 */
export function getMember(interaction, isContextMenu, isMessageContentMenuCommand, getType = 'member') {
    if (isContextMenu) {
        if (isMessageContentMenuCommand) {
           return interaction.targetMessage.author;
        } else {
            return interaction.targetUser;
        }
    }
    else {
        if (getType === 'user') {
            return interaction.options.getUser('user');
        } else {
            return interaction.options.getUser('member');
        }
    }
}

export async function getActiveEvent(pool, isCreateEvent = false) {
    const now = new Date();

    const result = await pool.query(
        "SELECT * FROM bet_events WHERE end_time > $1",
        [now]
    );

    if (result.rowCount > 0) {
        const activeEvent = result.rows[0];
        const eventEndTime = new Date(activeEvent.end_time);

        if (eventEndTime > now) {
            return activeEvent;
        }
    } else {
        if (isCreateEvent) {
            return null;
        } else {
            throw new Error("Активных событий для ставок не существует.");
        }
    }
}

export function formatDateToCustomString(dateString) {
    const date = new Date(dateString);

    // Получаем компоненты даты
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы с 0, поэтому +1
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes} (GMT +3)`;
}