import {
    ButtonStyle,
    Client,
    GatewayIntentBits,
    InteractionType,
    MessageFlags,
    PermissionsBitField,
    TextInputStyle
} from 'discord.js';
import dotenv from 'dotenv';
import pkg from 'pg';
import initializeDatabase from "./structure/dbInitialize.js";
import handleInfoCommand from "./structure/commandHandlers/handleInfoCommand.js";
import lastPositiveReviewsCommand from "./structure/commandHandlers/lastPositiveReviewsCommand.js";
import lastNegativeReviewsCommand from "./structure/commandHandlers/lastNegativeReviewsCommand.js";
import lastReviewsCommand from "./structure/commandHandlers/lastReviewsCommand.js";
import registerCommands from "./structure/registerCommands.js";
import handleAdminSettingsCommand from "./structure/commandHandlers/handleAdminSettingsCommand.js";
import showReviewModal from "./structure/showReviewModal.js";
import worstSellers from "./structure/commandHandlers/worstSellers.js";
import {sendPaginatedReviews} from "./structure/utils.js";
import updateRatings from "./structure/updateRatings.js";
import updateLeaderboard from "./structure/commandHandlers/updateLeaderboard.js";
import schedule from "node-schedule";
import setRolesByRanks from "./structure/setRolesByRanks.js";
import removeBots from "./structure/commandHandlers/subcommands/removeBots.js";

const {Pool} = pkg;
const pool = new Pool({connectionString: process.env.DATABASE_URL});

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
        console.error('❌ Guild not found. Проверьте GUILD_ID в .env');
        return;
    }

    await initializeDatabase(pool, guild);
    await registerCommands();

    schedule.scheduleJob('0 0 * * *', async () => {
        await updateRatings(pool);
        await updateLeaderboard(client, pool);
    });

    await updateRatings(pool);
    await setRolesByRanks(pool, guild);
    await updateLeaderboard(client, pool);
});

client.on('interactionCreate', async interaction => {
    const targetUser = interaction.options.getUser('user');

    if (interaction.isCommand() && interaction.commandName === 'admin_settings' && interaction.options.getSubcommand() === 'remove_bots') {
        removeBots(interaction, pool);
    }

    if (targetUser && targetUser.bot) {
        return interaction.reply({
            content: '🚫 Вы не можете использовать эту команду на боте!',
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.isCommand()) {
        if (interaction.commandName === 'info') {
            handleInfoCommand(interaction, pool);
        } else if (interaction.commandName === 'last_positive_reviews') {
            lastPositiveReviewsCommand(interaction, pool);
        } else if (interaction.commandName === 'last_negative_reviews') {
            lastNegativeReviewsCommand(interaction, pool);
        } else if (interaction.commandName === 'last_reviews') {
            lastReviewsCommand(interaction, pool);
        } else if (interaction.commandName === 'admin_settings' && interaction.options.getSubcommand() !== 'remove_bots') {
            const guild = interaction.guild;
            handleAdminSettingsCommand(interaction, pool, guild);
        } else if (interaction.commandName === 'worst_sellers') {
            worstSellers(interaction, pool);
        }
    } else if (interaction.isButton() && (interaction.customId.startsWith('upvote_') || interaction.customId.startsWith('downvote_'))) {
        const [action, userId] = interaction.customId.split('_');
        const reviewerId = interaction.user.id;

        const blockedReviewer = await pool.query('SELECT * FROM blocked_reviewers WHERE user_id = $1', [reviewerId]);
        if (blockedReviewer.rows.length > 0) {
            return interaction.reply({
                content: '🚫 Вы не можете оставлять отзывы, так как вам это запрещено.',
                flags: MessageFlags.Ephemeral
            });
        }

        const blockedReceiver = await pool.query('SELECT * FROM blocked_receivers WHERE user_id = $1', [userId]);
        if (blockedReceiver.rows.length > 0) {
            return interaction.reply({
                content: `🚫 Этот пользователь не может получать отзывы.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const cooldownSetting = await pool.query('SELECT value FROM settings WHERE key = \'cooldown_enabled\'');
        const cooldownMinutes = await pool.query('SELECT value FROM settings WHERE key = \'cooldown_minutes\'');

        const cooldownTime = parseInt(cooldownMinutes.rows[0]?.value || process.env.REVIEW_COOLDOWN_MINUTES) * 60 * 1000;
        const cooldownEnabled = cooldownSetting.rows[0]?.value === 'true';

        if (cooldownEnabled) {
            const lastReview = await pool.query(
                'SELECT "timestamp" FROM reviews WHERE reviewer_id = $1 AND target_user = $2 ORDER BY "timestamp" DESC LIMIT 1',
                [reviewerId, userId]
            );

            if (lastReview.rows.length > 0) {
                const lastReviewTime = new Date(lastReview.rows[0].timestamp);
                const timePassed = Date.now() - lastReviewTime.getTime();

                if (timePassed < cooldownTime) {
                    const remainingTime = Math.ceil((cooldownTime - timePassed) / 60000);
                    return interaction.reply({
                        content: `⏳ Вы уже оставили отзыв этому пользователю недавно. Попробуйте снова через **${remainingTime} минут**.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }

        const allowSelfVoting = await pool.query('SELECT value FROM settings WHERE key = \'allow_self_voting\'');
        const selfVotingEnabled = allowSelfVoting.rows.length > 0 ? allowSelfVoting.rows[0].value === 'true' : false;

        if (userId.toString() === reviewerId.toString() && !selfVotingEnabled) {
            return interaction.reply({
                content: '❌ Вы не можете оставлять отзыв самому себе.',
                flags: MessageFlags.Ephemeral
            });
        }

        await showReviewModal(interaction, action, userId);
    } else if (interaction.isButton() && (interaction.customId.startsWith('prev_reviews_') || interaction.customId.startsWith('next_reviews_'))) {
        const [, userId, page] = interaction.customId.split('_');
        await sendPaginatedReviews(interaction, pool, userId, parseInt(page));
    } else if (interaction.customId.startsWith('delete_review_')) {
        const [, , reviewId, userId, page] = interaction.customId.split('_');
        const parsedReviewId = parseInt(reviewId);
        const parsedPage = parseInt(page);

        if (isNaN(parsedReviewId) || isNaN(parsedPage)) {
            return interaction.reply({
                content: '❌ Ошибка: неверный ID отзыва или страницы.',
                flags: MessageFlags.Ephemeral
            });
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!isAdmin) {
            return interaction.reply({
                content: '❌ У вас нет прав на удаление отзывов!',
                flags: MessageFlags.Ephemeral
            });
        }

        const reviewData = await pool.query('SELECT is_positive FROM reviews WHERE id = $1', [parsedReviewId]);

        if (reviewData.rows.length === 0) {
            return interaction.reply({
                content: '❌ Ошибка: отзыв не найден.',
                flags: MessageFlags.Ephemeral
            });
        }

        const isPositive = reviewData.rows[0].is_positive;

        await pool.query('DELETE FROM reviews WHERE id = $1', [parsedReviewId]);

        if (isPositive) {
            await pool.query('UPDATE users SET positive_reviews = positive_reviews - 1 WHERE user_id = $1 AND positive_reviews > 0', [userId]);
        } else {
            await pool.query('UPDATE users SET negative_reviews = negative_reviews - 1 WHERE user_id = $1 AND negative_reviews > 0', [userId]);
        }

        await pool.query('UPDATE users SET rating = positive_reviews - negative_reviews WHERE user_id = $1', [userId]);

        await sendPaginatedReviews(interaction, pool, userId, parsedPage);
    } else if (interaction.isModalSubmit() && interaction.fields.getTextInputValue('review_text')) {
        const [_, action, userId] = interaction.customId.split('_');
        const reviewerId = interaction.user.id;
        const reviewText = interaction.fields.getTextInputValue('review_text');

        const isPositive = action === 'upvote';

        try {
            await pool.query(
                `INSERT INTO reviews (target_user, reviewer_id, is_positive, review_text, timestamp)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [userId, reviewerId, isPositive, reviewText]
            );

            const userStats = await pool.query(
                `SELECT 
            COUNT(CASE WHEN is_positive THEN 1 END) AS positive_reviews,
            COUNT(CASE WHEN NOT is_positive THEN 1 END) AS negative_reviews
         FROM reviews
         WHERE target_user = $1`,
                [userId]
            );

            const { positive_reviews, negative_reviews } = userStats.rows[0];
            const rating = positive_reviews - negative_reviews;

            await pool.query(
                `UPDATE users 
         SET positive_reviews = $1, negative_reviews = $2, rating = $3 
         WHERE user_id = $4`,
                [positive_reviews, negative_reviews, rating, userId]
            );

            await interaction.reply({
                content: '✅ Ваш отзыв сохранён!',
                flags: MessageFlags.Ephemeral
            });

            await updateRatings(pool);
        } catch (error) {
            console.error('❌ Ошибка при сохранении отзыва:', error);
            return interaction.reply({
                content: '❌ Произошла ошибка при сохранении отзыва. Попробуйте позже.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
});

client.login(process.env.BOT_TOKEN);
