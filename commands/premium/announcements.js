import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("announcements")
    .setDescription("Configure song announcements. (Premium only)")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable song announcements")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to announce songs in")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable song announcements")
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
        { announceSongs: true, announceChannel: channel.id }
      );

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Announcements Enabled")
        .setDescription(`Song updates will be announced in ${channel}.`);

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "disable") {
      await GuildConfig.updateOne(
        { guildId },
        { announceSongs: false, announceChannel: null }
      );

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Announcements Disabled")
        .setDescription("Song announcements have been turned off.");

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
