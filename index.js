import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { CommandKit } from "commandkit";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import { readdir, stat } from "fs/promises";
import { LavaShark } from "lavashark";
import dotenv from "dotenv";
import config from "./config.js";
import mongoose from "mongoose";
import GuildConfig from "./models/guildConfig.js";
dotenv.config();

// Connect to MongoDB
await mongoose
  .connect(process.env.MONGODB_URI)
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  devUserIds: config.devUserIds,
  devGuildIds: config.devGuildIds,
  bulkRegister: true,
});

const COMMAND_PREFIX = "c";

async function loadPrefixCommands() {
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  const categories = await readdir(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const stats = await stat(categoryPath);
    if (!stats.isDirectory()) continue;

    const files = await readdir(categoryPath);
    for (const file of files.filter((f) => f.endsWith(".js"))) {
      try {
        const { default: command } = await import(pathToFileURL(path.join(categoryPath, file)).href);
        if (command?.data?.name && typeof command.run === "function") {
          commands.set(command.data.name, command);
        }
      } catch (err) {
        console.error(`Failed to load command file ${file}:`, err);
      }
    }
  }

  return commands;
}

function createPrefixInteraction(message, args) {
  let replyMessage = null;
  const parsed = {};

  const parseOptions = () => {
    const sourceFlagIndex = args.findIndex(
      (a) => a === "--source" || a === "-s" || a.startsWith("--source=")
    );

    if (sourceFlagIndex !== -1) {
      const flag = args[sourceFlagIndex];
      if (flag.includes("=")) {
        parsed.source = flag.split("=")[1];
        args.splice(sourceFlagIndex, 1);
      } else {
        parsed.source = args[sourceFlagIndex + 1];
        args.splice(sourceFlagIndex, 2);
      }
    }
  };

  parseOptions();

  const queryString = args.join(" ").trim();

  return {
    client: message.client,
    guild: message.guild,
    member: message.member,
    user: message.author,
    channel: message.channel,
    options: {
      getString: (name) => {
        if (name === "query") return queryString || null;
        if (name === "source") return parsed.source || null;
        return null;
      },
    },
    deferReply: async (options) => {
      // Mimic slash command deferral by sending a temporary placeholder message.
      if (!replyMessage) {
        const content =
          options && typeof options === "object" && options.content
            ? options.content
            : "⏳ Processing...";
        replyMessage = await message.reply(content);
      }
      return replyMessage;
    },
    reply: async (response) => {
      if (replyMessage) return replyMessage.reply(response);
      if (typeof response === "string") {
        replyMessage = await message.reply(response);
      } else {
        replyMessage = await message.reply(response);
      }
      return replyMessage;
    },
    editReply: async (response) => {
      if (replyMessage) {
        return replyMessage.edit(response);
      }
      if (typeof response === "string") {
        replyMessage = await message.reply(response);
      } else {
        replyMessage = await message.reply(response);
      }
      return replyMessage;
    },
    followUp: async (response) => {
      return message.channel.send(response);
    },
  };
}

const prefixCommands = await loadPrefixCommands();

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const content = message.content.trim();
  if (!content.toLowerCase().startsWith(COMMAND_PREFIX)) return;

  const withoutPrefix = content.slice(COMMAND_PREFIX.length).trim();
  if (!withoutPrefix) return;

  const [commandName, ...args] = withoutPrefix.split(/\s+/);
  const command = prefixCommands.get(commandName.toLowerCase());
  if (!command) return;

  try {
    await command.run({ interaction: createPrefixInteraction(message, args) });
  } catch (err) {
    console.error(`Error executing prefix command c${commandName}:`, err);
    await message.reply("An error occurred while executing that command.");
  }
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

client.lavashark.on("error", (node, err) => {
  console.error("[LavaShark]", `Error on node ${node.identifier}`, err.message);
});

client.on("raw", (packet) => client.lavashark.handleVoiceUpdate(packet));

client.login(process.env.DISCORD_BOT_TOKEN);
