import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Edits an achievement in the database by updating a specified field with a new value.
 *
 * @param {Interaction} interaction - The interaction object containing user input data.
 * @return {Promise<void>} Resolves after updating the achievement and sending a confirmation reply to the user.
 */
export default async function editAchievement(interaction) {
    const name = interaction.options.getString('name');
    const field = interaction.options.getString('field'); // 'name' | 'description' | 'icon'
    const value = interaction.options.getString('value');

    await pool.query(`UPDATE achievements
                      SET ${field} = $1
                      WHERE name = $2`, [value, name]);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.achievementUpdated", {name}),
        flags: MessageFlags.Ephemeral
    });
}
