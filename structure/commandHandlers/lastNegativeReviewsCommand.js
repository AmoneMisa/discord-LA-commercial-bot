import {sendPaginatedReviews} from "../utils.js";
import {MessageFlags} from "discord.js";

export default async function handleLastNegativeReviewsCommand(interaction, pool) {
    const member = interaction.options.getUser('member');
    if (!member) return interaction.reply({ content: 'Выберите участника.', flags: MessageFlags.Ephemeral });

    const reviews = await pool.query(
        'SELECT review_text, "timestamp" FROM reviews WHERE target_user = $1 AND is_positive = false ORDER BY timestamp DESC',
        [member.id]
    );

    await sendPaginatedReviews(interaction, reviews.rows, member, 1);
}