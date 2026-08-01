require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// ==========================================
// EXPRESS WEB SERVER (For UptimeRobot)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is online and running 24/7!');
});

app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// ==========================================
// DISCORD BOT CONFIGURATION
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers 
    ]
});

const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID; 

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Helper function to safely give the role to a target member
async function assignAutoRole(member) {
    // CRUCIAL: If the updating user is a bot, skip them entirely!
    if (member.user.bot) return;

    // Skip if they are still pending/waiting on server onboarding screens
    if (member.pending) return;

    // Skip if they already have the role to prevent loops
    if (member.roles.cache.has(AUTO_ROLE_ID)) return;

    try {
        const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
        if (role) {
            await member.roles.add(role);
            console.log(`[Success] Gave the role to human user: ${member.user.tag}`);
        } else {
            console.error("[Error] Role ID not found in cache. Check AUTO_ROLE_ID on Render.");
        }
    } catch (error) {
        console.error("[Error] Failed to add role. Check role hierarchy!", error.message);
    }
}

// Event 1: When a user freshly joins the server
client.on('guildMemberAdd', async (member) => {
    await assignAutoRole(member);
});

// Event 2: When a user completes rules screening / verification
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    await assignAutoRole(newMember);
});

client.login(process.env.DISCORD_TOKEN);
