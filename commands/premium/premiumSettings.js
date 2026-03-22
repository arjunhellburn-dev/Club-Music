import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("premium-settings")
    .setDescription("View and manage your premium features")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

  run: async ({ interaction }) => {
    await interaction.deferReply();
    const guildId = interaction.guild.id;
    const guildConfig = await GuildConfig.findOne({ guildId });

    if (!guildConfig || !guildConfig.premium) {
      const nonPremiumEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Not Premium")
        .setDescription(
          "This server is not premium.\n\n**Run `/premium` to see the available plans.**"
        );
      return interaction.editReply({ embeds: [nonPremiumEmbed] });
    }

    const getDJRoleStatus = () => {
      if (!guildConfig.djRole) return "❌ Disabled";
      const role = interaction.guild.roles.cache.get(guildConfig.djRole);
      return role ? `✅ ${role.name}` : "❌ Role not found";
    };

    const getAnnounceStatus = () => {
      if (!guildConfig.announceSongs) return "❌ Disabled";
      const channel = interaction.guild.channels.cache.get(
        guildConfig.announceChannel
      );
      return channel ? `✅ ${channel.name}` : "❌ Channel not found";
    };

    const getRequestStatus = () => {
      if (!guildConfig.allowRequests) return "❌ Disabled";
      const channel = interaction.guild.channels.cache.get(
        guildConfig.requestChannel
      );
      return channel ? `✅ ${channel.name}` : "❌ Channel not found";
    };

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle(config.emoji.premium + " Premium Settings")
      .setDescription("Here's an overview of your premium features:")
      .addFields(
        {
          name: "🎵 Stay Connected",
          value: guildConfig.stayConnected ? "✅ Enabled" : "❌ Disabled",
          inline: true,
        },
        {
          name: "🎤 DJ Mode",
          value: getDJRoleStatus(),
          inline: true,
        },
        {
          name: "📢 Announcements",
          value: getAnnounceStatus(),
          inline: true,
        },
        {
          name: "🔊 Volume",
          value: `${guildConfig.volume}%`,
          inline: true,
        },
        {
          name: "🔁 Loop Mode",
          value: guildConfig.loopMode.toUpperCase() || "NONE",
          inline: true,
        },
        {
          name: "📋 Playlists",
          value: `${guildConfig.playlists.length} playlist(s)`,
          inline: true,
        },
        {
          name: "🎧 Song Requests",
          value: getRequestStatus(),
          inline: true,
        },
        {
          name: "📊 Statistics",
          value: `${guildConfig.stats.totalPlayed} songs played`,
          inline: true,
        }
      )
      .setFooter({
        text: "Use commands like /dj-mode, /announcements, /volume, etc. to configure these features",
      });

    return interaction.editReply({ embeds: [embed] });
  },
};
