import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the currently paused song"),

  run: async ({ interaction, client }) => {
    await interaction.deferReply();

    try {
      const player = client.lavashark.players.get(interaction.guild.id);

      if (!player) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("No player found for this guild."),
          ],
        });
      }

      if (!player.current) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("No music is currently playing."),
          ],
        });
      }

      if (!player.paused) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("The music is not paused."),
          ],
        });
      }

      await player.resume();

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Green")
            .setDescription("▶️ Music resumed."),
        ],
      });
    } catch (error) {
      console.error("Error in resume command:", error);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while resuming the music."),
        ],
      });
    }
  },
};
