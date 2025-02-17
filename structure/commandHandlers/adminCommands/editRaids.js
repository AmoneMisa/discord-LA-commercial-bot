import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

export default async function editRaids(interaction, pool) {
    const raids = await pool.query('SELECT id, raid_name FROM raids ORDER BY id LIMIT 20');

    if (raids.rows.length === 0) {
        return interaction.reply({
            content: '⚠ Ещё никаких рейдов не создано. Пожалуйста, создайте первый рейд.',
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_raid')
                        .setLabel('Создать')
                        .setStyle(ButtonStyle.Primary)
                )
            ],
            flags: MessageFlags.Ephemeral
        });
    }

    const components = [];

    raids.rows.forEach((raid) => {
        const button = new ButtonBuilder()
            .setCustomId(`delete_raid_${raid.id}`)
            .setLabel(`❌ ${raid.raid_name}`)
            .setStyle(ButtonStyle.Danger);

        components.push(button);
    });

    const rows = [];
    for (let i = 0; i < components.length; i += 5) {
        rows.push(new ActionRowBuilder().addComponents(components.slice(i, i + 5)));
    }

    rows.unshift(new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('create_raid')
            .setLabel('Создать')
            .setStyle(ButtonStyle.Success)
    ));

    if (interaction.replied) {
        await interaction.editReply({
            content: '📋 Список доступных рейдов:',
            components: rows,
            flags: MessageFlags.Ephemeral
        });
    } else {
        await interaction.reply({
            content: '📋 Список доступных рейдов:',
            components: rows,
            flags: MessageFlags.Ephemeral
        });
    }
}
