import { EmbedBuilder, MessageFlags } from "discord.js";
import config from "../../config.js";
import GuildConfig from "../../models/guildConfig.js";

export default async (interaction) => {
  try {
    // Check if it's a button interaction and starts with "music_"
    if (!interaction.isButton() || !interaction.customId.startsWith("music_"))
      return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const embed = new EmbedBuilder();
    const guild = interaction.guild;
    const member = interaction.member;
    const channel = member.voice?.channel;

    // Check if user is in a voice channel
    if (!channel) {
      embed.setColor("Red").setDescription(
        "❌ | You must be in a voice channel to use music controls."
      );
      return await interaction.editReply({ embeds: [embed] });
    }

    // Check if bot is in the same channel
    const botChannel = guild.members.me.voice?.channel;
    if (botChannel && botChannel.id !== channel.id) {
      embed.setColor("Red").setDescription(
        "❌ | You must be in the same voice channel as the bot."
      );
      return await interaction.editReply({ embeds: [embed] });
    }

    const player = interaction.client.lavashark.players.get(guild.id);
    if (!player || !player.current) {
      embed.setColor("Red").setDescription(
        "❌ | No music is currently playing."
      );
      return await interaction.editReply({ embeds: [embed] });
    }

    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });

    // Handle different button actions
    switch (interaction.customId) {
      case "music_skip":
        return handleSkip(interaction, player, embed);

      case "music_queue":
        return handleQueue(interaction, player, embed);

      case "music_nowplaying":
        return handleNowPlaying(interaction, player, embed);

      case "music_disconnect":
        return handleDisconnect(interaction, player, embed);

      case "music_loop":
        if (!guildConfig?.premium) {
          embed
            .setColor("Red")
            .setDescription(
              "❌ | This is a premium feature. Run `/premium` to upgrade."
            );
          return await interaction.editReply({ embeds: [embed] });
        }
        return handleLoop(interaction, guildConfig, embed);

      case "music_volume":
        if (!guildConfig?.premium) {
          embed
            .setColor("Red")
            .setDescription(
              "❌ | This is a premium feature. Run `/premium` to upgrade."
            );
          return await interaction.editReply({ embeds: [embed] });
        }
        return handleVolume(interaction, guildConfig, embed);

      case "music_playlist":
        if (!guildConfig?.premium) {
          embed
            .setColor("Red")
            .setDescription(
              "❌ | This is a premium feature. Run `/premium` to upgrade."
            );
          return await interaction.editReply({ embeds: [embed] });
        }
        return handlePlaylist(interaction, guildConfig, embed);

      case "music_stats":
        if (!guildConfig?.premium) {
          embed
            .setColor("Red")
            .setDescription(
              "❌ | This is a premium feature. Run `/premium` to upgrade."
            );
          return await interaction.editReply({ embeds: [embed] });
        }
        return handleStats(interaction, guildConfig, embed);

      default:
        embed.setColor("Red").setDescription("❌ | Unknown button action.");
        return await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error in musicButtons.js:", error);
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("❌ | An error occurred while processing your request.");
    return await interaction.editReply({ embeds: [embed] });
  }
};

// Button handlers
async function handleSkip(interaction, player, embed) {
  try {
    if (!player.queue.length && !player.current) {
      embed
        .setColor("Red")
        .setDescription("❌ | There are no more songs in the queue.");
      return await interaction.editReply({ embeds: [embed] });
    }

    const currentTrack = player.current?.info?.title || "Unknown";
    player.skip();

    embed
      .setColor("Green")
      .setTitle("⏭️ Song Skipped")
      .setDescription(`Skipped: \`${currentTrack}\``);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Skip error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to skip song.");
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleQueue(interaction, player, embed) {
  try {
    const queue = player.queue;

    if (!queue || queue.length === 0) {
      embed
        .setColor("Red")
        .setTitle("📋 Queue Empty")
        .setDescription(
          "No songs in the queue. Current song will finish and stop."
        );
      return await interaction.editReply({ embeds: [embed] });
    }

    const queueString = queue
      .slice(0, 10)
      .map((track, index) => `${index + 1}. \`${track.info.title}\``)
      .join("\n");

    embed
      .setColor("Blue")
      .setTitle("📋 Queue")
      .setDescription(queueString)
      .setFooter({
        text: `Total songs in queue: ${queue.length}`,
      });

    return await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Queue error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to fetch queue.");
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleNowPlaying(interaction, player, embed) {
  try {
    const currentTrack = player.current;

    if (!currentTrack) {
      embed
        .setColor("Red")
        .setDescription("❌ | No song is currently playing.");
      return await interaction.editReply({ embeds: [embed] });
    }

    const duration = formatDuration(currentTrack.info.length);
    const position = formatDuration(player.position);

    embed
      .setColor("Blue")
      .setTitle("🎵 Now Playing")
      .setDescription(`\`${currentTrack.info.title}\``)
      .addFields(
        {
          name: "Duration",
          value: `${position} / ${duration}`,
          inline: true,
        },
        {
          name: "Requested by",
          value: currentTrack.requester?.tag || "Unknown",
          inline: true,
        }
      );

    return await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Now Playing error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to fetch current track.");
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleDisconnect(interaction, player, embed) {
  try {
    await player.destroy();

    embed
      .setColor("Red")
      .setTitle("⏹️ Disconnected")
      .setDescription("The bot has left the voice channel.");
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Disconnect error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to disconnect.");
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleLoop(interaction, guildConfig, embed) {
  try {
    const modes = ["none", "song", "queue"];
    const currentMode = guildConfig.loopMode || "none";
    const currentIndex = modes.indexOf(currentMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    await GuildConfig.updateOne(
      { guildId: interaction.guild.id },
      { loopMode: nextMode }
    );

    const modeDescriptions = {
      none: "🔁 Off - Queue will play normally",
      song: "🔁 Song - Current song will loop",
      queue: "🔁 Queue - Entire queue will loop",
    };

    embed
      .setColor("Green")
      .setTitle("🔁 Loop Mode Changed")
      .setDescription(modeDescriptions[nextMode]);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Loop error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to change loop mode.");
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleVolume(interaction, guildConfig, embed) {
  try {
    const currentVolume = guildConfig.volume || 100;
    const volumes = [50, 75, 100, 125, 150];
    const currentIndex = volumes.indexOf(currentVolume);
    const nextVolume = volumes[(currentIndex + 1) % volumes.length];

    await GuildConfig.updateOne(
      { guildId: interaction.guild.id },
      { volume: nextVolume }
    );

    embed
      .setColor("Green")
      .setTitle("🔊 Volume Changed")
      .setDescription(
        `Volume set to **${nextVolume}%**\n\n_Cycles: 50% → 75% → 100% → 125% → 150%_`
      );
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Volume error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to change volume.");
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handlePlaylist(interaction, guildConfig, embed) {
  try {
    if (!guildConfig.playlists || guildConfig.playlists.length === 0) {
      embed
        .setColor("Red")
        .setDescription(
          "❌ | No playlists exist. Create one with `/playlist create`"
        );
      return await interaction.editReply({ embeds: [embed] });
    }

    const playlistNames = guildConfig.playlists
      .map((p) => `• **${p.name}** (${p.songs.length} songs)`)
      .join("\n");

    embed
      .setColor("Blue")
      .setTitle("📝 Playlists")
      .setDescription(playlistNames)
      .setFooter({
        text: "Use /playlist to manage playlists",
      });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Playlist error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to fetch playlists.");
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleStats(interaction, guildConfig, embed) {
  try {
    const stats = guildConfig.stats || { totalPlayed: 0, topSongs: [] };

    let description = `**Total Songs Played:** ${stats.totalPlayed}\n\n`;

    if (stats.topSongs && stats.topSongs.length > 0) {
      const topTracks = stats.topSongs
        .slice(0, 5)
        .map((song, i) => `${i + 1}. **${song.title}** - ${song.plays} plays`)
        .join("\n");

      description += "**Top 5 Songs:**\n" + topTracks;
    } else {
      description += "No songs have been played yet.";
    }

    embed
      .setColor("Blue")
      .setTitle("📊 Music Statistics")
      .setDescription(description);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Stats error:", error);
    embed.setColor("Red").setDescription("❌ | Failed to fetch statistics.");
    await interaction.editReply({ embeds: [embed] });
  }
}

// Helper function to format duration
function formatDuration(milliseconds) {
  if (!milliseconds) return "0:00";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
