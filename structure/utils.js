import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    PermissionsBitField,
    TextInputStyle
} from "discord.js";
import {getItemName} from "./dbUtils.js";

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

export async function sendPaginatedReviews(interaction, pool, page = 1, isPositive, memberId) {
    const reviewsPerPage = 5;
    const offset = (page - 1) * reviewsPerPage;
    const member = await interaction.guild.members.fetch(memberId);
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

    let reviews;

    if (isPositive) {
        reviews = await pool.query(
            'SELECT id, reviewer_id, review_text, is_positive, "timestamp" FROM reviews WHERE target_user = $1 AND is_positive = true ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
            [member.id, reviewsPerPage, offset]
        );
    } else if (!isPositive) {
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
        message += `**${index + 1}.** <@${review.reviewer_id}>: ${review.is_positive ? '✅' : '❌'} "${review.review_text}" *(${formatDate(review.timestamp)})* \n`;

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
                .setCustomId(`prev_reviews_${member.id}_${page - 1}`)
                .setLabel('⬅️ Назад')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    if (page < totalPages) {
        paginationButtons.addComponents(
            new ButtonBuilder()
                .setCustomId(`next_reviews_${member.id}_${page + 1}`)
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

    await interaction.reply({ content, components: [actionRow], flags: MessageFlags.Ephemeral });
}

export async function createLotItemMessage(pool, type, options) {
    if (type !== "WTT" && type !== "WTS" && type !== "WTB") {
        console.error("Переданный тип некорректный", type);
        return;
    }

    if (type === "WTT") {
        const {item_offer, item_request, type, amount_offer, amount_request, offer_level, request_level, expires_at} = options;
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

export async function delay(ms) {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(1000);
}