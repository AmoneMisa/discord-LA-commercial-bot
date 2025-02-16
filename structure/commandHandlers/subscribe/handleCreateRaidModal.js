import {MessageFlags} from "discord.js";
import editRaids from "../adminCommands/editRaids.js";

export default async function(interaction, pool) {
    const raidName = interaction.fields.getTextInputValue('raid_name');

    await pool.query('INSERT INTO raids (raid_name) VALUES ($1)', [raidName]);

    await interaction.reply({
        content: `✅ Рейд **"${raidName}"** успешно создан!`,
        flags: MessageFlags.Ephemeral
    });

    editRaids(interaction, pool);
}