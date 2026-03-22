import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("song-requests")
    .setDescription("Enable or disable song requests. (Premium only)")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable song requests")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel for song requests")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable song requests")
    )
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

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "enable") {
      const channel = interaction.options.getChannel("channel");

      if (!channel.isTextBased()) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ Please select a text channel."),
          ],
        });
      }

      await GuildConfig.updateOne(
        { guildId },
        { allowRequests: true, requestChannel: channel.id }
      );

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Song Requests Enabled")
        .setDescription(
          `Song requests are now enabled in ${channel}.\n\nUsers can request songs using \`/request <song name>\``
        );

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "disable") {
      await GuildConfig.updateOne(
        { guildId },
        { allowRequests: false, requestChannel: null }
      );

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Song Requests Disabled")
        .setDescription("Song requests have been turned off.");

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
