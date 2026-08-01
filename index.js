require('dotenv').config(); // Loads variables from your environment
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// ==========================================
// 1. EXPRESS WEB SERVER (For UptimeRobot)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

// Returns a status text when visited in a browser
app.get('/', (req, res) => {
    res.send('Bot is online and running 24/7!');
});

app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// ==========================================
// 2. DISCORD BOT CONFIGURATION
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers // Crucial intent to spot new users
    ]
});

// Grab the Auto Role ID from your environment settings
const AUTO_ROLE_ID = process.env.AUTO_ROLE_ID; 

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Listens for a user completing verification or joining the server
// Fires when a member changes (like passing the rules screening gate)
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // Check if the user just completed the verification/rules screening screen
    if (oldMember.pending && !newMember.pending) {
        try {
            // Find the role in the server cache
            const role = newMember.guild.roles.cache.get(AUTO_ROLE_ID);
            
            if (role) {
                await newMember.roles.add(role);
                console.log(`Successfully assigned role to verified user: ${newMember.user.tag}`);
            } else {
                console.error("Could not find the target role. Please verify your AUTO_ROLE_ID.");
            }
        } catch (error) {
            console.error("Encountered an error assigning role:", error);
        }
    }
});


// Log your bot online using the secure token
client.login(process.env.DISCORD_TOKEN);
