import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music and clear the queue."),
  run: async ({ interaction, client }) => {
    await interaction.deferReply();
    try {
      const player = client.lavashark.players.get(interaction.guild.id);

      if (!player) {
        return await interaction.editReply("No player found for this guild.");
      }
      await player.stop();
      await interaction.editReply("Music stopped and queue cleared.");
    } catch (error) {
      console.error("Error in stop command:", error);
      await interaction.editReply(
        "An error occurred while stopping the music.",
      );
    }
  },
};
