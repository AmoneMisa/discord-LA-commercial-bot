import {ActionRowBuilder, StringSelectMenuBuilder, MessageFlags} from "discord.js";
import {translatedMessage} from "../../utils.js";

export default async function (interaction, isNotification) {
    const raids = await pool.query('SELECT raid_name FROM raids');

    if (raids.rows.length === 0) {
        return interaction.reply({
            content: await translatedMessage(interaction, "errors.noRaids"),
            flags: MessageFlags.Ephemeral
        });
    }

    const options = raids.rows.map(raid => ({
        label: raid.raid_name,
        value: raid.raid_name
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(isNotification ? 'select_raid_for_notification' : 'select_raid_for_subscription')
        .setPlaceholder(await translatedMessage(interaction, "info.raidsSelectPlaceholder"))
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
        content: await translatedMessage(interaction, "info.selectRaid"),
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}