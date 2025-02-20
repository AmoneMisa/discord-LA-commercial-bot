import {getItemsList} from "../dbUtils.js";

export default async function (interaction, pool) {
    const focusedOption = interaction.options.getFocused(true);
    const items = await getItemsList(pool); // Получаем предметы из базы

    const filtered = items
        .filter(item => item.label.includes(focusedOption.value))
        .slice(0, 25); // Discord ограничивает до 25 вариантов

    await interaction.respond(
        filtered.map(item => ({name: item.label, value: item.value.toString()}))
    );
}