import mongoose from "mongoose";

const guildConfigSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  stayConnected: {
    type: Boolean,
    default: false,
  },
  premium: {
    type: Boolean,
    default: false,
  },
  premiumUsers: [
    {
      userId: {
        type: String,
        required: true,
      },
      grantedBy: {
        type: String,
        default: null,
      },
      grantedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Premium Features
  djRole: {
    type: String,
    default: null,
  },
  announceSongs: {
    type: Boolean,
    default: false,
  },
  announceChannel: {
    type: String,
    default: null,
  },
  volume: {
    type: Number,
    default: 100,
    min: 1,
    max: 200,
  },
  loopMode: {
    type: String,
    enum: ["none", "song", "queue"],
    default: "none",
  },
  allowRequests: {
    type: Boolean,
    default: false,
  },
  requestChannel: {
    type: String,
    default: null,
  },
  playlists: [
    {
      name: String,
      songs: [String],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  stats: {
    totalPlayed: { type: Number, default: 0 },
    topSongs: [
      {
        url: String,
        title: String,
        plays: Number,
      },
    ],
  },
});

const GuildConfig = mongoose.model("GuildConfig", guildConfigSchema);

export default GuildConfig;
