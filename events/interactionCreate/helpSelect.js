import { EmbedBuilder, MessageFlags } from "discord.js";
import config from "../../config.js";

const miscCommands = [
  {
    name: "help",
    description: "Shows this help menu.",
  },
  {
    name: "ping",
    description: "Check if the bot is alive.",
  },
  {
    name: "invite",
    description: "Get the bot's invite link.",
  },
];

const musicCommands = [
  {
    name: "play",
    description: "Play a song with ⏭️ Skip, 📋 Queue, 🎵 Now Playing, ⏹️ Stop buttons!",
  },
  {
    name: "join",
    description: "Make the bot join your voice channel.",
  },
  {
    name: "disconnect",
    description: "Make the bot leave your voice channel.",
  },
  {
    name: "skip",
    description: "Skip the current song.",
  },
  {
    name: "nowplaying",
    description: "Show the current song playing.",
  },
  {
    name: "queue",
    description: "Show the current song queue.",
  },
];

const premiumCommands = [
  {
    name: "stay-connected",
    description: "Keep the bot connected when voice channel is empty.",
    premium: true,
  },
  {
    name: "dj-mode",
    description: "Restrict music commands to members with a specific DJ role.",
    premium: true,
  },
  {
    name: "announcements",
    description: "Configure song announcements in a dedicated channel.",
    premium: true,
  },
  {
    name: "volume",
    description: "Control bot audio volume (1-200%).",
    premium: true,
  },
  {
    name: "loop",
    description: "Set loop mode: Off, Song, or Queue.",
    premium: true,
  },
  {
    name: "playlist",
    description: "Create and manage custom playlists.",
    premium: true,
  },
  {
    name: "song-requests",
    description: "Enable song request system for your server.",
    premium: true,
  },
  {
    name: "stats",
    description: "View music statistics and top songs.",
    premium: true,
  },
  {
    name: "premium-settings",
    description: "View and manage all premium features.",
    premium: true,
  },
];

const settingsCommands = [
  {
    name: "stay-connected",
    description:
      "Keep the bot connected to the voice channel even when no one is in it.",
    premium: config.premiumCmds.stayConnected,
  },
  {
    name: "set-music-channel",
    description:
      "Sets a specific voice channel where the bot will always play music and ignore others.",
  },
];

export default async (interaction) => {
  try {
    if (
      !interaction.isStringSelectMenu() ||
      interaction.customId !== "help-menu"
    )
      return;

    let selectedCommands;
    let categoryTitle;
    let thumbnail = interaction.client.user.displayAvatarURL();
    switch (interaction.values[0]) {
      case "misc":
        selectedCommands = miscCommands;
        categoryTitle = `${config.emoji.misc} Miscellaneous Commands`;
        break;
      case "music":
        selectedCommands = musicCommands;
        categoryTitle = `${config.emoji.music} Music Commands`;
        break;
      case "premium":
        selectedCommands = premiumCommands;
        categoryTitle = `${config.emoji.premium} Premium Features`;
        break;
      case "settings":
        selectedCommands = settingsCommands;
        categoryTitle = `${config.emoji.settings} Settings Commands`;
        break;
      default:
        return;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(thumbnail)
      .setColor("White")
      .setTitle(categoryTitle)
      .addFields(
        selectedCommands.map((cmd) => ({
          name: `\`/${cmd.name}\` / \`c${cmd.name}\` ${cmd.premium ? (config.emoji.premium || "⭐") : ""}`,
          value: cmd.description,
          inline: false,
        }))
      );

    await interaction.update({ embeds: [embed] });
  } catch (error) {
    console.error("Error in helpSelect.js:", error);
    await interaction.reply({
      content: "An error occurred while processing your request.",
      flags: MessageFlags.Ephemeral,
    });
  }
};

export { miscCommands, premiumCommands };
