import sendReview from "../commandHandlers/ranks/sendReview.js";

export default async function(interaction, pool, client) {
    if (interaction.fields.fields.get('review_text') && interaction.fields.getTextInputValue('review_text')) {
        await sendReview(interaction, pool, client);
    }
}