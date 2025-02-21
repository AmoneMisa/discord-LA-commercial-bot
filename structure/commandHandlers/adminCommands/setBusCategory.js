import {MessageFlags} from "discord.js";

export default async function setBusCategory(interaction, pool) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    const category = interaction.options.getChannel('category');

    if (category.type !== 4) { // 4 = категория в Discord API
        return interaction.reply({
            content: '🚫 Вы должны выбрать **категорию**, а не обычный канал!',
            flags: MessageFlags.Ephemeral
        });
    }

    await pool.query(`
        INSERT INTO settings (key, value) VALUES ('bus_category', $1)
            ON CONFLICT (key) DO UPDATE SET value = $1;
    `, [category.id]);

    await interaction.editReply({
        content: `✅ Категория <#${category.id}> теперь отслеживается для рейдов.`,
        flags: MessageFlags.Ephemeral
    });
}
