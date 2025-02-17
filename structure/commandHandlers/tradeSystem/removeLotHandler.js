import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import {getItemName} from "../dbUtils.js";
import {createLotItemMessage} from "../../utils.js";

export default async function removeLotHandler(interaction, pool) {
    const userId = interaction.user.id;
    const page = interaction.options.getInteger('page') || 1;
    const offset = (page - 1) * 5;

    const lots = await pool.query(`
        SELECT id, item_offer, item_request, type, amount_offer, amount_request, offer_level, request_level, price, expires_at
        FROM inventory WHERE user_id = $1
        ORDER BY expires_at ASC
        LIMIT 5 OFFSET $2
    `, [userId, offset]);

    if (lots.rows.length === 0) {
        return interaction.reply({
            content: "📭 У вас нет активных лотов.",
            flags: MessageFlags.Ephemeral
        });
    }

    let message = "📋 **Ваши активные лоты:**\n";
    const buttons = new ActionRowBuilder();

    for (const lot of lots.rows) {
        const index = lots.rows.indexOf(lot);
        message += `**${index + 1}.** ${await createLotItemMessage(pool, lot.type, lot)}\n\n`;

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_lot_${lot.id}`)
                .setLabel(`❌ ${index + 1}`)
                .setStyle(ButtonStyle.Danger)
        );
    }

    const pagination = new ActionRowBuilder();
    if (page > 1) {
        pagination.addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_lot_page_${page - 1}`)
                .setLabel("⬅️ Назад")
                .setStyle(ButtonStyle.Secondary)
        );
    }
    if (lots.rows.length === 5) {
        pagination.addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_lot_page_${page + 1}`)
                .setLabel("➡️ Вперёд")
                .setStyle(ButtonStyle.Secondary)
        );
    }

    await interaction.reply({
        content: message,
        components: pagination.components.length ? [buttons, pagination] : [buttons],
        flags: MessageFlags.Ephemeral
    });
}
