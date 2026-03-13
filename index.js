import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { CommandKit } from "commandkit";
import { fileURLToPath } from "url";
import path from "path";
import { LavaShark } from "lavashark";
import config from "./config.js";
import mongoose from "mongoose";
import GuildConfig from "./models/guildConfig.js";

// Connect to MongoDB
await mongoose
  .connect(config.mongodb_uri)
  .then(() => {
    console.log("Connected to MongoDB Instance.");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
client.config = config;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  bulkRegister: true,
});

const lavashark = new LavaShark({
  nodes: config.nodes,
  sendWS: (guildId, payload) => {
    client.guilds.cache.get(guildId)?.shard.send(payload);
  },
});

client.lavashark = lavashark;

// -- LavaShark events --
client.lavashark.on("trackStart", (player, track) => {
  const channel = client.channels.cache.get(player.textChannelId);

  if (!channel) return;

  const videoId = track.uri.split("v=")[1]?.split("&")[0];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const requesterAvatar =
    track.requester?.avatarURL() || "https://example.com/default-avatar.png";

  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setDescription(`${config.emoji.music} Now playing \`${track.title}\``)
    .setThumbnail(thumbnailUrl)
    .setFooter({
      iconURL: requesterAvatar,
      text: `Requested by ${track.requester?.tag || "Unknown"}`,
    })
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

client.lavashark.on("queueEnd", async (player) => {
  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setDescription(`${config.emoji.sad} Queue ended`)
    .setTimestamp();
  channel.send({ embeds: [embed] });

  try {
    const guildConfig = await GuildConfig.findOne({
      guildId: player.guildId,
    });

    if (!guildConfig || !guildConfig.stayConnected) {
      player.destroy();
    }
  } catch (err) {
    console.error("Error in queueEnd:", err);
  }
});

// ===== NODE AUTO RECONNECT SYSTEM =====

const reconnectAttempts = new Map();

client.lavashark.on("nodeConnect", async (node) => {
  console.log(`[LavaShark] Node ${node.identifier} connected.`);
  reconnectAttempts.delete(node.identifier);
  const players = client.lavashark.players;

  for (const player of players.values()) {
    try {
      await player.connect();
      console.log(`Reconnected player in guild ${player.guildId}`);
    } catch (err) {
      console.error(`Failed to reconnect player:`, err.message);
    }
  }
});
client.lavashark.on("error", (node, err) => {
  console.error("[LavaShark]", `Error on node ${node.identifier}`, err.message);
});

client.lavashark.on("nodeRaw", (node, payload) => {
  if (payload.op === "stats") {
    console.log(`Players: ${payload.players} | CPU: ${payload.cpu.systemLoad}`);
  }
});

client.on("raw", (packet) => client.lavashark.handleVoiceUpdate(packet));

client.login(config.token);
