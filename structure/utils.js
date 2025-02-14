import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from "discord.js";

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

export async function sendPaginatedReviews(interaction, reviews, member, isPositive = null) {
    if (reviews.length === 0) {
        return interaction.reply({ content: 'Нет отзывов.', flags: MessageFlags.Ephemeral });
    }

    let page = 0;
    const pageSize = 5;
    const totalPages = Math.ceil(reviews.length / pageSize);

    const generateMessage = () => {
        const start = page * pageSize;
        const end = start + pageSize;
        const reviewSlice = reviews.slice(start, end);
        const reviewMessages = reviewSlice.map(review => `${review.is_positive !== undefined ? (review.is_positive ? '👍' : '👎') : ''} ${formatDate(review.timestamp)} - ${review.review_text}`).join('\n');
        return `Отзывы пользователя **${member.username}**\n\n${reviewMessages}\n\nСтраница ${page + 1}/${totalPages}`;
    };

    const updateMessage = async (msg) => {
        await msg.edit({
            content: generateMessage(),
            components: [getPaginationButtons(page, totalPages)]
        });
    };

    const getPaginationButtons = (currentPage, total) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev_page')
                .setLabel('⬅️ Назад')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('Вперёд ➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage >= total - 1)
        );
    };

    const msg = await interaction.reply({
        content: generateMessage(),
        components: [getPaginationButtons(page, totalPages)],
        flags: MessageFlags.Ephemeral,
        fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({ time: 600000 });
    collector.on('collect', async i => {
        if (i.customId === 'prev_page') page--;
        if (i.customId === 'next_page') page++;
        await updateMessage(msg);
        await i.deferUpdate();
    });
}

export function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}