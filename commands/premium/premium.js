import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionsBitField,
} from "discord.js";
import config from "../../config.js";
import PremiumUser from "../../models/premiumUser.js";

export default {
  data: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Manage premium features (Bot Owner Only)")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("View premium features information")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Enable/Disable a premium command")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("The premium command to toggle")
            .setRequired(true)
            .addChoices(
              { name: "Stay Connected", value: "stayConnected" },
              { name: "DJ Mode", value: "djMode" },
              { name: "Announcements", value: "announcements" },
              { name: "Volume Control", value: "volumeControl" },
              { name: "Loop Mode", value: "loopMode" },
              { name: "Playlists", value: "playlists" },
              { name: "Song Requests", value: "songRequests" },
              { name: "Statistics", value: "statistics" }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable the command")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("grant")
        .setDescription("Grant premium access to a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to grant premium access to")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("revoke")
        .setDescription("Revoke premium access from a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to revoke premium access from")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List all premium users")
    ),

  run: async ({ interaction }) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Check if user is bot owner
    const application = await interaction.client.application.fetch();
    const ownerId = application.owner.id;

    if (interaction.user.id !== ownerId) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Access Denied")
        .setDescription("This command is only available to the bot owner.");

      return interaction.editReply({ embeds: [errorEmbed] });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "info") {
      const featuresList = [
        `${config.premiumCmds.stayConnected ? "✅" : "❌"} **Stay Connected** - Keep bot in voice channel when empty`,
        `${config.premiumCmds.djMode ? "✅" : "❌"} **DJ Mode** - Restrict music commands to DJ role`,
        `${config.premiumCmds.announcements ? "✅" : "❌"} **Announcements** - Announce songs in a channel`,
        `${config.premiumCmds.volumeControl ? "✅" : "❌"} **Volume Control** - Set custom audio volume (1-200%)`,
        `${config.premiumCmds.loopMode ? "✅" : "❌"} **Loop Mode** - Loop songs or queue`,
        `${config.premiumCmds.playlists ? "✅" : "❌"} **Playlists** - Save and manage custom playlists`,
        `${config.premiumCmds.songRequests ? "✅" : "❌"} **Song Requests** - Allow members to request songs`,
        `${config.premiumCmds.statistics ? "✅" : "❌"} **Statistics** - Track music statistics`,
      ];

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle(`${config.emoji.premium} Premium Features Dashboard`)
        .setDescription(
          "Here's an overview of all available premium features and their current status:"
        )
        .addFields(
          {
            name: "📊 Feature Status",
            value: featuresList.join("\n"),
          },
          {
            name: "ℹ️ How to Enable Features",
            value:
              "Use `/premium toggle` to enable or disable individual premium commands for all servers using this bot instance.",
          }
        )
        .setFooter({
          text: "Use /premium toggle to manage premium commands",
        })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "toggle") {
      const commandName = interaction.options.getString("command");
      const enabled = interaction.options.getBoolean("enabled");

      if (!(commandName in config.premiumCmds)) {
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Invalid Command")
          .setDescription("The specified premium command does not exist.");

        return interaction.editReply({ embeds: [errorEmbed] });
      }

      const previousState = config.premiumCmds[commandName];
      config.premiumCmds[commandName] = enabled;

      const commandDisplayName = {
        stayConnected: "Stay Connected",
        djMode: "DJ Mode",
        announcements: "Announcements",
        volumeControl: "Volume Control",
        loopMode: "Loop Mode",
        playlists: "Playlists",
        songRequests: "Song Requests",
        statistics: "Statistics",
      }[commandName];

      const action = enabled ? "✅ **ENABLED**" : "❌ **DISABLED**";

      const embed = new EmbedBuilder()
        .setColor(enabled ? "Green" : "Yellow")
        .setTitle(`Premium Command Updated`)
        .setDescription(
          `**${commandDisplayName}** is now ${action}\n\nThis change affects all servers using this bot instance.`
        )
        .addFields(
          {
            name: "Previous State",
            value: previousState ? "✅ Enabled" : "❌ Disabled",
            inline: true,
          },
          {
            name: "New State",
            value: enabled ? "✅ Enabled" : "❌ Disabled",
            inline: true,
          }
        )
        .setFooter({
          text: "Remember to update your config file to persist these changes",
        })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "grant") {
      try {
        const targetUser = interaction.options.getUser("user");

        // Check if user already has premium
        const existingPremiumUser = await PremiumUser.findOne({ userId: targetUser.id });

        if (existingPremiumUser && existingPremiumUser.isPremium) {
          const alreadyPremiumEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("⚠️ Already Premium")
            .setDescription(`**${targetUser.username}** already has premium access.`);

          return interaction.editReply({ embeds: [alreadyPremiumEmbed] });
        }

        // Grant premium access
        if (existingPremiumUser) {
          existingPremiumUser.isPremium = true;
          existingPremiumUser.grantedBy = interaction.user.id;
          existingPremiumUser.grantedAt = new Date();
          await existingPremiumUser.save();
        } else {
          await PremiumUser.create({
            userId: targetUser.id,
            username: targetUser.username,
            grantedBy: interaction.user.id,
            isPremium: true,
          });
        }

        const successEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ Premium Access Granted")
          .setDescription(`**${targetUser.username}** now has premium access!`)
          .addFields(
            {
              name: "User ID",
              value: targetUser.id,
              inline: true,
            },
            {
              name: "Granted By",
              value: interaction.user.username,
              inline: true,
            },
            {
              name: "Granted At",
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: false,
            }
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setTimestamp();

        return interaction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        console.error("Error granting premium:", error);
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Error")
          .setDescription("An error occurred while granting premium access.");

        return interaction.editReply({ embeds: [errorEmbed] });
      }
    }

    if (subcommand === "revoke") {
      try {
        const targetUser = interaction.options.getUser("user");

        // Find and revoke premium
        const premiumUser = await PremiumUser.findOne({ userId: targetUser.id });

        if (!premiumUser || !premiumUser.isPremium) {
          const notPremiumEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Not Premium")
            .setDescription(`**${targetUser.username}** does not have premium access.`);

          return interaction.editReply({ embeds: [notPremiumEmbed] });
        }

        premiumUser.isPremium = false;
        await premiumUser.save();

        const successEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("✅ Premium Access Revoked")
          .setDescription(`**${targetUser.username}** premium access has been revoked.`)
          .addFields(
            {
              name: "User ID",
              value: targetUser.id,
              inline: true,
            },
            {
              name: "Revoked By",
              value: interaction.user.username,
              inline: true,
            },
            {
              name: "Revoked At",
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: false,
            }
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setTimestamp();

        return interaction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        console.error("Error revoking premium:", error);
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Error")
          .setDescription("An error occurred while revoking premium access.");

        return interaction.editReply({ embeds: [errorEmbed] });
      }
    }

    if (subcommand === "list") {
      try {
        const premiumUsers = await PremiumUser.find({ isPremium: true });

        if (premiumUsers.length === 0) {
          const emptyEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("📊 Premium Users")
            .setDescription("There are currently no premium users.");

          return interaction.editReply({ embeds: [emptyEmbed] });
        }

        const userList = premiumUsers
          .map(
            (user, index) =>
              `${index + 1}. **${user.username || "Unknown"}** (${user.userId})\n   └─ Granted by: <@${user.grantedBy}> on <t:${Math.floor(user.grantedAt.getTime() / 1000)}:d>`
          )
          .join("\n");

        const embed = new EmbedBuilder()
          .setColor("Gold")
          .setTitle(`${config.emoji.premium} Premium Users List`)
          .setDescription(userList || "No premium users found.")
          .addFields({
            name: "Total Premium Users",
            value: `${premiumUsers.length}`,
            inline: true,
          })
          .setFooter({
            text: `Last updated`,
          })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error("Error listing premium users:", error);
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Error")
          .setDescription("An error occurred while fetching premium users.");

        return interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  },
};
