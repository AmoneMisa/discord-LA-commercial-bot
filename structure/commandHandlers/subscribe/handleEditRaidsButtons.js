import editRaids from "../adminCommands/editRaids.js";
import {ActionRowBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

/**
 * Handles the interaction events triggered by raid-related buttons, allowing creation or deletion of raids.
 *
 * @param {Object} interaction - The interaction object containing information about the button click.
 * @param {string} interaction.customId - The custom identifier of the button clicked.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @return {Promise<void>} Resolves when the raid interaction is handled successfully.
 */
export default async function handleEditRaidsButtons(interaction, pool) {
    if (interaction.customId === 'create_raid') {
        const modal = new ModalBuilder()
            .setCustomId('create_raid_modal')
            .setTitle('Создание нового рейда');

        const raidNameInput = new TextInputBuilder()
            .setCustomId('raid_name')
            .setLabel('Название рейда')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Введите название рейда');
        const actionRow = new ActionRowBuilder().addComponents(raidNameInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);

    } else if (interaction.customId.startsWith('delete_raid')) {
        const raidId = interaction.customId.split('_')[2];

        await pool.query('DELETE FROM available_raids WHERE raid_id = $1', [raidId]);
        await pool.query('DELETE FROM raids WHERE id = $1', [raidId]);

        await interaction.reply({
            content: `🗑 Рейд успешно удалён!`,
            flags: MessageFlags.Ephemeral
        });

        await editRaids(interaction, pool);
    }
}
