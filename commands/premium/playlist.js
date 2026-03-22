import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import GuildConfig from "../../models/guildConfig.js";
import config from "../../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Manage custom playlists. (Premium only)")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a new playlist")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Name of the playlist")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add current song to a playlist")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Playlist name")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("View all playlists")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a playlist")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Playlist name")
            .setRequired(true)
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

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const name = interaction.options.getString("name");

      if (guildConfig.playlists.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ A playlist with this name already exists!"),
          ],
        });
      }

      guildConfig.playlists.push({ name, songs: [] });
      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Playlist Created")
        .setDescription(`Created playlist: **${name}**`);

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "list") {
      if (guildConfig.playlists.length === 0) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                "❌ No playlists found. Create one with `/playlist create`!"
              ),
          ],
        });
      }

      const playlistList = guildConfig.playlists
        .map((p) => `**${p.name}** - ${p.songs.length} song(s)`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📋 Your Playlists")
        .setDescription(playlistList);

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "delete") {
      const name = interaction.options.getString("name");
      const index = guildConfig.playlists.findIndex(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );

      if (index === -1) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ Playlist not found!"),
          ],
        });
      }

      guildConfig.playlists.splice(index, 1);
      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Playlist Deleted")
        .setDescription(`Deleted playlist: **${name}**`);

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "add") {
      const name = interaction.options.getString("name");

      const playlist = guildConfig.playlists.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );

      if (!playlist) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ Playlist not found!"),
          ],
        });
      }

      // Note: In actual implementation, get currently playing song from player
      playlist.songs.push("song-url-placeholder");
      await guildConfig.save();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Song Added")
        .setDescription(`Added song to **${name}** playlist!`);

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
