import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    PermissionsBitField,
    TextInputStyle
} from "discord.js";
import {getItemName, getUserLanguage} from "./dbUtils.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import i18n from "../locales/i18n.js";

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

    const lang = await getUserLanguage(interaction.user.id, pool);
    if (reviews.rows.length === 0) {
        return interaction.reply({
            content: i18n.t("info.userDontHaveReviews", { lng: lang, memberId: member.id}),
            flags: MessageFlags.Ephemeral
        });
    }

    let message = i18n.t("info.reviewsAboutUser", { lng: lang, memberId: member.id, page});
    let buttons = new ActionRowBuilder();

    for (const review of reviews.rows) {
        const index = reviews.rows.indexOf(review);
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text.substring(0, 300)}" *(${formatDate(review.timestamp)})* \n`;

        if (isAdmin) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_review_${review.id}_${member.id}_${page}`)
                    .setLabel(i18n.t("buttons.delete", { lng: lang, index: index + 1}))
                    .setStyle(ButtonStyle.Danger)
            );
        }
    }

    const totalReviews = await pool.query('SELECT COUNT(*) FROM reviews WHERE target_user = $1', [member.id]);
    const totalPages = Math.ceil(parseInt(totalReviews.rows[0].count) / reviewsPerPage);

    let paginationButtons = new ActionRowBuilder();
    if (page > 1) {
        paginationButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`prev_reviews_${member.id}_${page - 1}_${isPositive}`)
                .setLabel(i18n.t("buttons.back", { lng: lang}))
                .setStyle(ButtonStyle.Secondary)
        );
    }
    if (page < totalPages) {
        paginationButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`next_reviews_${member.id}_${page + 1}_${isPositive}`)
                .setLabel(i18n.t("buttons.next", { lng: lang}))
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
export function getMember(interaction, isContextMenu = false, isMessageContentMenuCommand = false, getType = 'member') {
    if (isContextMenu) {
        if (isMessageContentMenuCommand) {
            if (getType === 'user') {
                return interaction.user;
            } else {
                return interaction.targetMessage.author;
            }
        } else {
           return interaction.targetUser;
        }
    } else {
        if (getType === 'user') {
            if (interaction?.options?.getUser('user')) {
                return interaction.options.getUser('user');
            }
            return interaction.user;
        } else {
            if (interaction.options.getUser('member')) {
                return interaction.options.getUser('member');
            }
            return interaction.member;
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

        return null;
    } else {
        if (isCreateEvent) {
            return null;
        } else {
            throw new Error("Активных событий для ставок не существует.");
        }
    }
}

/**
 * Sends a paginated list of items as an ephemeral message in response to an interaction.
 *
 * @param {object} interaction - The interaction object from Discord API, used for replying to the user.
 * @param {Array} rows - An array of data rows to paginate and display.
 * @param {object} pool - The database connection pool instance used for database operations.
 * @param {number} [page=1] - The current page number of the pagination, defaults to 1.
 * @return {Promise<void>} A promise that resolves when the reply is successfully sent.
 */
export async function sendPaginatedList(interaction, rows, pool, page = 1) {
    const totalPages = Math.ceil(rows.length / 5);
    const startIndex = (page - 1) * 5;
    const paginatedRows = rows.slice(startIndex, startIndex + 5);

    let content = `📜 **Ваши фавориты (Страница ${page}/${totalPages})**\n\n`;
    for (const row of paginatedRows) {
        const seller = await interaction.client.users.fetch(row.seller_id);
        content += `👤 **<@${seller.id}>** - 🏆 Рейтинг: ${row.rating || 0}\n`;
    }

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`subscribe_prev_page_${page - 1}`)
            .setLabel('⬅ Назад')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId(`subscribe_next_page_${page + 1}`)
            .setLabel('Вперед ➡')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages)
    );

    await interaction.reply({content, components: [actionRow], flags: MessageFlags.Ephemeral});
}

/**
 * Generates a formatted message describing a lot item based on the provided type and options.
 *
 * @param {Object} pool - The database connection pool for retrieving item names.
 * @param {string} type - The type of the lot item message. Allowed values are "WTT", "WTS", and "WTB".
 * @param {Object} options - An object containing details about the lot item, including offers, requests, levels, amounts, prices, and expiration time.
 * @param {string} options.item_offer - The identifier of the item being offered (applicable for "WTT" and "WTB").
 * @param {string} options.item_request - The identifier of the item being requested (applicable for "WTT" and "WTS").
 * @param {number} options.amount_offer - The quantity of the item being offered (applicable for "WTT" and "WTB").
 * @param {number} options.amount_request - The quantity of the item being requested (applicable for "WTT" and "WTS").
 * @param {string} [options.offer_level] - The level of the offered item (optional, applicable for "WTT" and "WTB").
 * @param {string} [options.request_level] - The level of the requested item (optional, applicable for "WTT" and "WTS").
 * @param {number} [options.price] - The price in gold for the item (optional, applicable for "WTB" and "WTS").
 * @param {Date} options.expires_at - The date and time until the lot item is valid.
 * @return {Promise<string|undefined>} A promise that resolves to the formatted lot item message, or `undefined` if the type is invalid.
 */
export async function createLotItemMessage(pool, type, options) {
    if (type !== "WTT" && type !== "WTS" && type !== "WTB") {
        console.error("Переданный тип некорректный", type);
        return;
    }

    if (type === "WTT") {
        const {
            item_offer,
            item_request,
            type,
            amount_offer,
            amount_request,
            offer_level,
            request_level,
            expires_at
        } = options;
        return `${type} | Предложено: ${await getItemName(pool, item_offer)}, к-во: ${amount_offer}, уровень: ${offer_level ? offer_level : 'нет уровня'}\nЗапрошено: ${await getItemName(pool, item_request)}, к-во: ${amount_request}, уровень: ${request_level ? request_level : 'нет уровня'}.\n⏳ Предложение до: ${expires_at.toLocaleString()}`;
    }

    if (type === "WTS") {
        const {item_request, type, amount_request, request_level, price, expires_at} = options;
        return `${type} | Запрошено: ${await getItemName(pool, item_request)}, к-во: ${amount_request}, уровень: ${request_level ? request_level : 'нет уровня'}, стоимость: ${price}к золота.\n⏳ Предложение до: ${expires_at.toLocaleString()}`;
    }

    if (type === "WTB") {
        const {item_offer, type, amount_offer, offer_level, price, expires_at} = options;
        return `${type} | Предложено: ${await getItemName(pool, item_offer)}, к-во: ${amount_offer}, уровень: ${offer_level ? offer_level : 'нет уровня'}, стоимость: ${price}к золота.\n⏳ Предложение до: ${expires_at.toLocaleString()}`;
    }
}

/**
 * Delays the execution for a specified amount of time in milliseconds.
 *
 * @param {number} ms - The amount of time in milliseconds to delay the execution.
 * @return {Promise<void>} A promise that resolves after the specified delay time.
 */
export async function delay(ms) {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(1000);
}

/**
 * Randomly shuffles the elements of an array in place.
 *
 * @param {Array} array - The array to be shuffled.
 * @return {Array} The shuffled array.
 */
export function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDateToCustomString(dateString, userTimezone = dayjs.tz.guess()) {
    // Конвертируем дату в нужный часовой пояс
    const date = dayjs.utc(dateString).tz(userTimezone);

    // Форматируем в строку "dd.mm.yyyy hh:mm (GTM +X)"
    return `${date.format("DD.MM.YYYY HH:mm")} (GMT ${date.format("Z")})`;
}

export function parseDateToTimestamp(dateString) {
    const currentYear = dayjs().year(); // Текущий год
    const currentTime = dayjs().format("HH:mm"); // Текущее время

    let parsedDate = null;

    // Проверяем и парсим возможные форматы
    if (/^\d{2}\.\d{2}$/.test(dateString)) {
        // Формат "dd.mm" (добавляем текущий год и время)
        parsedDate = dayjs(`${dateString}.${currentYear} ${currentTime}`, "DD.MM.YYYY HH:mm");
    } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
        // Формат "dd.mm.yyyy" (добавляем текущее время)
        parsedDate = dayjs(`${dateString} ${currentTime}`, "DD.MM.YYYY HH:mm");
    } else if (/^\d{2}\.\d{2} \d{2}:\d{2}$/.test(dateString)) {
        // Формат "dd.mm hh:mm" (добавляем текущий год)
        parsedDate = dayjs(`${dateString} ${currentYear}`, "DD.MM HH:mm YYYY");
    } else if (/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/.test(dateString)) {
        // Формат "dd.mm.yyyy hh:mm"
        parsedDate = dayjs(dateString, "DD.MM.YYYY HH:mm");
    } else {
        throw new Error(`⚠ Ошибка: Неверный формат даты: ${dateString}! Используйте один из форматов: \n- dd.mm \n- dd.mm.yyyy \n- dd.mm hh:mm \n- dd.mm.yyyy hh:mm`);
    }

    if (!parsedDate.isValid()) {
        throw new Error(`⚠ Ошибка: Неверная дата: ${parsedDate}`);
    }

    return parsedDate.valueOf(); // Возвращаем Unix timestamp (в миллисекундах)
}

export function parseFormattedNumber(str) {
    let cleanedStr = str.replace(/[\s.,]/g, '');

    if (!/^\d+$/.test(cleanedStr)) {
        return NaN; // Строка невалидна
    }

    return parseInt(cleanedStr, 10);
}

/**
 *
 * @param interaction {Object}
 * @param content {String}
 * @param components {Array}
 * @param isEphemeral {Boolean}
 * @returns {Promise<void>}
 */
export async function reply(interaction, content, components = [], isEphemeral = true) {
    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content, components, flags: isEphemeral ? MessageFlags.Ephemeral : null });
    } else {
        await interaction.reply({ content, components, flags: isEphemeral ? MessageFlags.Ephemeral : null });
    }
}