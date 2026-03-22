import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dj-mode")
    .setDescription("Set a DJ role for music commands. (Premium only)")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set a role as DJ")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to set as DJ")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove the DJ role restriction")
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

    if (subcommand === "set") {
      const role = interaction.options.getRole("role");
      await GuildConfig.updateOne({ guildId }, { djRole: role.id });

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ DJ Mode Enabled")
        .setDescription(
          `Only members with the ${role} role can use music commands.`
        );
      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "remove") {
      await GuildConfig.updateOne({ guildId }, { djRole: null });

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ DJ Mode Disabled")
        .setDescription("All members can use music commands again.");
      return interaction.editReply({ embeds: [embed] });
    }
  },
};
