import {sendPaginatedReviews} from "../../utils.js";
import {MessageFlags} from "discord.js";

export default async function (interaction, pool) {
    const member = interaction.options.getUser('member');
    if (!member) return interaction.reply({content: 'Выберите участника.', flags: MessageFlags.Ephemeral});

    await sendPaginatedReviews(interaction, pool, member, 1, true);
}