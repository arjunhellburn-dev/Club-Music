import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View music statistics for this server. (Premium only)")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

  run: async ({ interaction }) => {
    await interaction.deferReply();
    const guildId = interaction.guild.id;
    const guildConfig = await GuildConfig.findOne({ guildId });

    const nonPremiumEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Premium Feature")
      .setDescription(
        "**This is a premium only feature.**\n\nPlease upgrade your plan to use this feature.\n**Run `/premium` to see the available plans.**"
      );

    if (!guildConfig || !guildConfig.premium) {
      return interaction.editReply({ embeds: [nonPremiumEmbed] });
    }

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📊 Music Statistics")
      .addFields({
        name: "Total Songs Played",
        value: guildConfig.stats.totalPlayed.toString(),
        inline: true,
      });

    if (guildConfig.stats.topSongs.length > 0) {
      const topSongsText = guildConfig.stats.topSongs
        .slice(0, 10)
        .map(
          (song, i) =>
            `${i + 1}. **${song.title}** - ${song.plays} plays`
        )
        .join("\n");

      embed.addFields({
        name: "🎵 Top 10 Songs",
        value: topSongsText,
      });
    } else {
      embed.addFields({
        name: "🎵 Top Songs",
        value: "No songs have been played yet.",
      });
    }

    embed.setFooter({
      text: "Keep playing songs to build your statistics!",
    });

    return interaction.editReply({ embeds: [embed] });
  },
};
