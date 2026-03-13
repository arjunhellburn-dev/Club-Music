import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses the currently playing music."),
  run: async ({ interaction, client }) => {
    await interaction.deferReply();
    try {
      const player = client.lavashark.players.get(interaction.guild.id);
      if (!player) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("No player found for this guild."),
          ],
        });
      }
      if (!player.current) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("No music is currently playing."),
          ],
        });
      }
      await player.pause();
      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor("Green").setDescription("Music paused."),
        ],
      });
    } catch (error) {
      console.error("Error in pause command:", error);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while pausing the music."),
        ],
      });
    }
  },
};
