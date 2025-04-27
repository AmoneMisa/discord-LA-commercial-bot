import editRaids from "../adminCommands/editRaids.js";
import {ActionRowBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Handles the interaction events triggered by raid-related buttons, allowing creation or deletion of raids.
 *
 * @param {Object} interaction - The interaction object containing information about the button click.
 * @param {string} interaction.customId - The custom identifier of the button clicked.
 * @return {Promise<void>} Resolves when the raid interaction is handled successfully.
 */
export default async function handleEditRaidsButtons(interaction) {
    if (interaction.customId === 'create_raid') {
        const modal = new ModalBuilder()
            .setCustomId('create_raid_modal')
            .setTitle(await translatedMessage(interaction, 'raids.create_raid_title'));

        const raidNameInput = new TextInputBuilder()
            .setCustomId('raid_name')
            .setLabel(await translatedMessage(interaction, 'raids.raid_name_label'))
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(await translatedMessage(interaction, 'raids.raid_name_placeholder'));

        const actionRow = new ActionRowBuilder().addComponents(raidNameInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);

    } else if (interaction.customId.startsWith('delete_raid')) {
        const raidId = interaction.customId.split('_')[2];

        await pool.query('DELETE FROM available_raids WHERE raid_id = $1', [raidId]);
        await pool.query('DELETE FROM raids WHERE id = $1', [raidId]);

        await interaction.reply({
            content: await translatedMessage(interaction, 'raids.raid_deleted'),
            flags: MessageFlags.Ephemeral
        });

        await editRaids(interaction);
    }
}
