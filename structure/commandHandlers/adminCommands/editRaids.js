import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from 'discord.js';
import {translatedMessage} from "../../utils.js";

/**
 * Handles the editing of raids by retrieving a list of raids from the database,
 * creating interactive buttons for each raid, and updating the interaction response.
 *
 * @param {Object} interaction - The Discord interaction instance that triggered the command.
 * @param {Object} pool - The database connection pool to query raid information.
 * @return {Promise<void>} Resolves when the interaction response has been handled.
 */
export default async function editRaids(interaction, pool) {
    const raids = await pool.query('SELECT id, raid_name FROM raids ORDER BY id LIMIT 20');

    if (raids.rows.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "info.noRaids"),
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_raid')
                        .setLabel(await translatedMessage(interaction, "buttons.createRaid"))
                        .setStyle(ButtonStyle.Primary)
                )
            ],
            flags: MessageFlags.Ephemeral
        });
    }

    const components = raids.rows.map((raid) =>
        new ButtonBuilder()
            .setCustomId(`delete_raid_${raid.id}`)
            .setLabel(`❌ ${raid.raid_name}`)
            .setStyle(ButtonStyle.Danger)
    );

    const rows = [];
    for (let i = 0; i < components.length; i += 5) {
        rows.push(new ActionRowBuilder().addComponents(components.slice(i, i + 5)));
    }

    // Добавляем кнопку "Создать рейд" в начало
    rows.unshift(new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('create_raid')
            .setLabel(await translatedMessage(interaction, "buttons.createRaid"))
            .setStyle(ButtonStyle.Success)
    ));

    const content = await translatedMessage(interaction, "info.raidList");

    if (interaction.replied) {
        await interaction.editReply({
            content,
            components: rows,
            flags: MessageFlags.Ephemeral
        });
    } else {
        await interaction.reply({
            content,
            components: rows,
            flags: MessageFlags.Ephemeral
        });
    }
}