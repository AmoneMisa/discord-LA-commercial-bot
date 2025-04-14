import {MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

/**
 * Deletes an achievement from the database and notifies the user of the deletion.
 *
 * @param {Object} interaction - The interaction object containing user input.
 * @return {Promise<void>} Resolves when the achievement is successfully deleted and a response is sent.
 */
export default async function deleteAchievement(interaction) {
    const name = interaction.options.getString('name');

    await pool.query(`DELETE
                      FROM achievements
                      WHERE name = $1`, [name]);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.achievementDeleted", {name}),
        flags: MessageFlags.Ephemeral
    });
}