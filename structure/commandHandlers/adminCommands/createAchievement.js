import {MessageFlags} from "discord.js";
import {saveAchievementIcon} from "../achievements/saveAchievementIcon.js";

export default async function createAchievement(interaction, pool) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const icon = interaction.options.getAttachment('icon');

    if (!icon) {
        return interaction.reply({ content: '❌ Прикрепите изображение PNG.', flags: MessageFlags.Ephemeral });
    }

    const savedPath = saveAchievementIcon(name, icon.url);

    if (savedPath) {
        await interaction.reply({ content: `🏆 Достижение **${name}** создано!\n📁 Файл сохранён: ${savedPath}`, flags: MessageFlags.Ephemeral });
    } else {
        await interaction.reply({ content: '❌ Ошибка при сохранении иконки.', flags: MessageFlags.Ephemeral });
    }

    await pool.query(
        `INSERT INTO achievements (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [name, description, icon.url]
    );

    await interaction.reply({ content: `✅ Достижение **${name}** создано!`, flags: MessageFlags.Ephemeral });
}
