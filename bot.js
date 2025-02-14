import {ButtonStyle, Client, GatewayIntentBits, InteractionType, MessageFlags, TextInputStyle} from 'discord.js';
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
import topSellers from "./structure/commandHandlers/topSellers.js";
import worstSellers from "./structure/commandHandlers/worstSellers.js";

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
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'info') {
            handleInfoCommand(interaction, pool);
        } else if (interaction.commandName === 'last_positive_reviews') {
            lastPositiveReviewsCommand(interaction, pool);
        } else if (interaction.commandName === 'last_negative_reviews') {
            lastNegativeReviewsCommand(interaction, pool);
        } else if (interaction.commandName === 'last_reviews') {
            lastReviewsCommand(interaction, pool);
        } else if (interaction.commandName === 'admin_settings') {
            const guild = interaction.guild;
            handleAdminSettingsCommand(interaction, pool, guild);
        } else if (interaction.commandName === 'top_sellers') {
            topSellers(interaction, pool);
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

        if (userId.toString() === reviewerId.toString() && allowSelfVoting.rows[0]?.value !== 'true') {
            return interaction.reply({
                content: '❌ Вы не можете оставлять отзыв самому себе.',
                flags: MessageFlags.Ephemeral
            });
        }

        await showReviewModal(interaction, action, userId);
    }
});

client.login(process.env.BOT_TOKEN);
