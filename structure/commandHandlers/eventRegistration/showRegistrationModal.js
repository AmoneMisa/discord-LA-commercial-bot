import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

/**
 * Handles an interaction to display a modal for event registration.
 * The modal includes two input fields:
 * 1. Character nickname input (required).
 * 2. Party members' nicknames input (required).
 *
 * @param {Object} interaction - The interaction object representing the user's action.
 * @returns {Promise<void>} A promise that resolves when the modal is shown to the user.
 */
export default async function (interaction) {
    const modal = new ModalBuilder()
        .setCustomId(`register_event_${interaction.message.id}`)
        .setTitle("Регистрация на ивент");

    const nameInput = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Ник персонажа для участия")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const partyInput = new TextInputBuilder()
        .setCustomId("party")
        .setLabel("Ники игроков через запятую, которые участвуют с Вами")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const actionRows = [
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(partyInput),
    ];

    modal.addComponents(...actionRows);
    await interaction.showModal(modal);
}