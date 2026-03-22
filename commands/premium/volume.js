import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Control the bot's audio volume. (Premium only)")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Volume level (1-200)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(200)
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

    const level = interaction.options.getInteger("level");
    await GuildConfig.updateOne({ guildId }, { volume: level });

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("🔊 Volume Changed")
      .setDescription(`Volume set to **${level}%**`)
      .addFields({
        name: "Note",
        value: "Volume changes will apply to the next song played.",
      });

    return interaction.editReply({ embeds: [embed] });
  },
};
