import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set loop mode for music playback. (Premium only)")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop mode to set")
        .setRequired(true)
        .addChoices(
          { name: "Off (None)", value: "none" },
          { name: "Current Song", value: "song" },
          { name: "Entire Queue", value: "queue" }
        )
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

    const mode = interaction.options.getString("mode");
    await GuildConfig.updateOne({ guildId }, { loopMode: mode });

    const modeDescriptions = {
      none: "Loop is **off** - Queue will play normally",
      song: "Current song will **loop** until manually changed",
      queue: "Entire **queue will loop** after reaching the end",
    };

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("🔁 Loop Mode Updated")
      .setDescription(modeDescriptions[mode]);

    return interaction.editReply({ embeds: [embed] });
  },
};
