import { MessageFlags } from 'discord.js';
import {translatedMessage} from "../../utils.js";
import ownLotsList from "./ownLotsList.js";

export default async function (interaction) {
    const customId = interaction.customId;
    const parts = customId.split('.');

    const action = parts[1]; // delete
    const lotId = parts[2];  // 123

    if (action === 'delete') {
        try {
            const { rowCount } = await pool.query(
                `DELETE FROM marketplace_lots WHERE id = $1 AND seller_id = $2`,
                [lotId, interaction.user.id]
            );

            if (rowCount === 0) {
                await interaction.reply({
                    content: await translatedMessage(interaction, 'errors.lotNotFound'),
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            await interaction.reply({
                content: await translatedMessage(interaction, 'market.lotDeleted'),
                flags: MessageFlags.Ephemeral
            });

            // Обновляем список
            setTimeout(async () => {
                await ownLotsList(interaction, true);
            }, 1000);

        } catch (error) {
            console.error('Ошибка при удалении лота:', error);
            await interaction.reply({
                content: await translatedMessage(interaction, 'errors.unexpectedError'),
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
