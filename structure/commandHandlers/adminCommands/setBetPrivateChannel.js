export default async function (interaction, pool) {
    const channel = interaction.options.getChannel("channel");

    await pool.query("UPDATE settings SET value = $1 WHERE key = 'bet_info_private_channel_id'", [channel.id]);
    return interaction.reply({ content: `✅ Канал для ставок установлен: <#${channel.id}>`, ephemeral: true });
}
