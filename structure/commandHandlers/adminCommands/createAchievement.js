import {MessageFlags} from "discord.js";
import saveAchievementIcon from "../achievements/saveAchievementIcon.js";
import {translatedMessage} from "../../utils.js";

/**
 * Creates a new achievement with the provided name, description, and icon.
 *
 * @param {Object} interaction - The interaction object containing command options and reply methods.
 * @param {Object} pool - The database connection pool used to execute queries.
 * @return {Promise<void>} A promise that resolves when the achievement is successfully created or an error is sent.
 */
export default async function createAchievement(interaction) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const icon = interaction.options.getAttachment('icon');

    if (!icon) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.attachmentMustBePng"),
            flags: MessageFlags.Ephemeral
        });
    }

    const isAchievementExist = await pool.query(`SELECT *
                                                 FROM achievements
                                                 WHERE name = $1`, [name]);

    if (isAchievementExist.rows.length) {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.achievementAlreadyExists"),
            flags: MessageFlags.Ephemeral
        });
    }

    const savedPath = await saveAchievementIcon(name, icon);

    if (savedPath) {
        await interaction.reply({
            content: await translatedMessage(interaction, "info.achievementCreated", {name, savedPath}),
            flags: MessageFlags.Ephemeral
        });
    } else {
        return await interaction.reply({
            content: await translatedMessage(interaction, "errors.achievementIconSaveFailed"),
            flags: MessageFlags.Ephemeral
        });
    }

    await pool.query(
        `INSERT INTO achievements (name, description, icon)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [name, description, icon.url]
    );
}