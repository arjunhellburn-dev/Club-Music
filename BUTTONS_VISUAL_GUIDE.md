# Music Buttons Visual Guide

## What Users See When Playing a Song

### Non-Premium Server

```
╔════════════════════════════════════════╗
║  🎵 Added `Never Gonna Give You Up`    ║
║                                        ║
║  [Thumbnail/Album Art]                 ║
║                                        ║
║  Requested by user#0000                ║
╚════════════════════════════════════════╝

┌─────────────────────────────────────────┐
│ [⏭️ Skip] [📋 Queue] [🎵 Now Playing] [⏹️ Stop] │
└─────────────────────────────────────────┘
```

### Premium Server

```
╔════════════════════════════════════════╗
║  🎵 Added `Never Gonna Give You Up`    ║
║                                        ║
║  [Thumbnail/Album Art]                 ║
║                                        ║
║  Requested by user#0000                ║
╚════════════════════════════════════════╝

┌─────────────────────────────────────────┐
│ [⏭️ Skip] [📋 Queue] [🎵 Now Playing] [⏹️ Stop] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [🔁 Loop] [🔊 Volume] [📝 Playlists] [📊 Stats] │
└─────────────────────────────────────────┘
```

## Button Click Responses

### When User Clicks ⏭️ Skip

```
╔════════════════════════════════════════╗
║ ⏭️ Song Skipped                         ║
║ Skipped: `Never Gonna Give You Up`    ║
╚════════════════════════════════════════╝
```

### When User Clicks 📋 Queue

```
╔════════════════════════════════════════╗
║ 📋 Queue                               ║
║                                        ║
║ 1. `Somebody Else`                    ║
║ 2. `Take On Me`                       ║
║ 3. `Wonderwall`                       ║
║ 4. `Bohemian Rhapsody`                ║
║ 5. `Stairway to Heaven`               ║
║ ... (5 more)                          ║
║                                        ║
║ Total songs in queue: 10              ║
╚════════════════════════════════════════╝
```

### When User Clicks 🎵 Now Playing

```
╔════════════════════════════════════════╗
║ 🎵 Now Playing                         ║
║ `Never Gonna Give You Up`             ║
║                                        ║
║ Duration: 1:23 / 3:32                 ║
║ Requested by: user#0000               ║
╚════════════════════════════════════════╝
```

### When User Clicks 🔁 Loop

```
First Click (Off → Song):
╔════════════════════════════════════════╗
║ 🔁 Loop Mode Changed                   ║
║ 🔁 Song - Current song will loop      ║
╚════════════════════════════════════════╝

Second Click (Song → Queue):
╔════════════════════════════════════════╗
║ 🔁 Loop Mode Changed                   ║
║ 🔁 Queue - Entire queue will loop     ║
╚════════════════════════════════════════╝

Third Click (Queue → Off):
╔════════════════════════════════════════╗
║ 🔁 Loop Mode Changed                   ║
║ 🔁 Off - Queue will play normally     ║
╚════════════════════════════════════════╝
```

### When User Clicks 🔊 Volume

```
First Click (100% → 125%):
╔════════════════════════════════════════╗
║ 🔊 Volume Changed                      ║
║ Volume set to **125%**                 ║
║                                        ║
║ Cycles: 50% → 75% → 100% → 125% → 150%║
╚════════════════════════════════════════╝
```

### When User Clicks 📝 Playlists

```
╔════════════════════════════════════════╗
║ 📝 Playlists                           ║
║                                        ║
║ • **Chill Vibes** (15 songs)           ║
║ • **Gaming Music** (32 songs)          ║
║ • **Workout** (28 songs)               ║
║ • **Party Mix** (45 songs)             ║
║                                        ║
║ Use /playlist to manage playlists      ║
╚════════════════════════════════════════╝
```

### When User Clicks 📊 Stats

```
╔════════════════════════════════════════╗
║ 📊 Music Statistics                    ║
║                                        ║
║ Total Songs Played: 247                ║
║                                        ║
║ Top 5 Songs:                           ║
║ 1. Never Gonna Give You Up - 12 plays  ║
║ 2. Wonderwall - 9 plays                ║
║ 3. Take On Me - 8 plays                ║
║ 4. Believer - 7 plays                  ║
║ 5. Shape of You - 6 plays              ║
╚════════════════════════════════════════╝
```

## Button Color Coding

### Color Meanings

| Color | Style | Meaning | Buttons |
|-------|-------|---------|---------|
| 🔵 Blue | Primary | Main actions | Skip, Queue, Now Playing |
| 🔴 Red | Danger | Destructive action | Stop/Disconnect |
| ⚫ Gray | Secondary | Premium features | Loop, Volume, Playlists, Stats |

## Error Scenarios

### User Not in Voice Channel

```
❌ | You must be in a voice channel to use music controls.
```

### Different Voice Channel

```
❌ | You must be in the same voice channel as the bot.
```

### No Music Playing

```
❌ | No music is currently playing.
```

### Non-Premium User Clicks Premium Button

```
❌ | This is a premium feature. Run `/premium` to upgrade.
```

### Empty Queue

```
❌ | There are no more songs in the queue.
```

## Button State Progression

### Loop Button State Machine

```
         ┌─────────────────────┐
         │   LOOP OFF (none)   │
         │  Queue plays once   │
         └──────────┬──────────┘
                    │ Click Button
                    ▼
         ┌─────────────────────┐
         │  LOOP SONG (song)   │
         │ Current song repeats│
         └──────────┬──────────┘
                    │ Click Button
                    ▼
         ┌─────────────────────┐
         │ LOOP QUEUE (queue)  │
         │ Queue repeats after │
         └──────────┬──────────┘
                    │ Click Button
                    ▼
         ┌─────────────────────┐
         └─────────────────────┘
         (Goes back to OFF)
```

### Volume State Machine

```
50% → 75% → 100% → 125% → 150% → 50% → ...
 ↑                                    │
 └────────────────────────────────────┘
     (Cycles on button click)
```

## Interaction Flow Diagram

```
User Types /play

    ↓

Bot Joins Voice Channel

    ↓

Bot Searches for Song

    ↓

Bot Sends Embed + Buttons

    ↓

User Clicks Button

    ↓

musicButtons.js Handler Triggered

    ↓

Checks:
├─ User in voice channel?
├─ Same channel as bot?
├─ Music playing?
└─ Premium requirement met?

    ↓

Execute Action:
├─ Skip Song
├─ Show Queue
├─ Show Now Playing
├─ Stop Bot
├─ Change Loop
├─ Change Volume
├─ Show Playlists
└─ Show Stats

    ↓

Send Ephemeral Response

    ↓

Response disappears after 15 seconds
```

## Button Appearance Details

### Button Styling

```javascript
// Primary Buttons (Blue) - Main Actions
ButtonBuilder()
  .setStyle(ButtonStyle.Primary)  // Blue

// Secondary Buttons (Gray) - Optional/Premium
ButtonBuilder()
  .setStyle(ButtonStyle.Secondary)  // Gray

// Danger Buttons (Red) - Destructive
ButtonBuilder()
  .setStyle(ButtonStyle.Danger)  // Red
```

### Custom IDs

Every button has a custom ID starting with `music_`:
- `music_skip`
- `music_queue`
- `music_nowplaying`
- `music_disconnect`
- `music_loop`
- `music_volume`
- `music_playlist`
- `music_stats`

## Responsive Behavior

- ✅ Works on Desktop
- ✅ Works on Mobile Discord App
- ✅ Works on Web Discord
- ✅ Buttons persist until interaction
- ✅ Response is ephemeral (private)

## Performance Considerations

- **No Rate Limiting**: Each button click counts as 1 interaction
- **Instant Response**: Handlers use deferred replies for faster perception
- **Lightweight**: No heavy computations in button handlers
- **Database Efficient**: Only fetches GuildConfig once per interaction

---

**Note**: All button responses are ephemeral, meaning only the person who clicked the button can see the response. This keeps the chat clean!
