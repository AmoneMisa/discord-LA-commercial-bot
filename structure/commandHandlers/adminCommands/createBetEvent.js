import {MessageFlags} from "discord.js";

/**
 * Creates a new bet event and saves it in the database, then sends a reply to the interaction.
 *
 * @param {Object} interaction - The interaction object representing the command invocation.
 * @param {Object} pool - The database connection pool used for executing the query.
 * @param {Object} interaction.options - The options object containing command parameters.
 * @param {string} interaction.options.getString - A method to retrieve string options from the interaction.
 * @return {Promise<void>} A promise that resolves once the bet event is created and a response is sent.
 */
export default async function (interaction, pool) {
    const result = await pool.query("SELECT * FROM bets_events");
    const isEventExist = result.rows.find(_event => _event.end_time < new Date().getTime());

    if (isEventExist) {
        await interaction.reply("Событие уже существует");
        return;
    }

    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const startTime = interaction.options.getString('start_time');
    const endTime = interaction.options.getString('end_time');
    const participantsRaw = interaction.options.getString("participants");

    let participants = participantsRaw.split(",").map(nick => nick.trim());
    participants = [...new Set(participants)];

    if (participants.length === 0) {
        return interaction.reply({ content: "⚠ Ошибка: Список участников не может быть пустым.", ephemeral: true });
    }
    await pool.query(
        `INSERT INTO bet_events (name, description, start_time, end_time) 
         VALUES ($1, $2, $3, $4)`,
        [name, description, startTime, endTime]
    );

    await interaction.reply({ content: `✅ **Событие "${name}" создано!**\n📌 **Описание:** ${description}\n🕒 **Срок:** ${startTime} - ${endTime}\n👥 **Участники:** ${participants.join(", ")}`,
         flags: MessageFlags.Ephemeral });
}
