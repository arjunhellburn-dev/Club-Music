# Music Control Buttons Guide

## Overview

When you use the `/play` command, the bot now displays interactive buttons for quick music control. These buttons provide instant access to common music features without needing to type additional commands.

## Button Layout

### Row 1: Basic Controls (Available to All Users)

- **⏭️ Skip** - Skip to the next song in the queue
- **📋 Queue** - View the next 10 songs in the queue
- **🎵 Now Playing** - Display current track info with duration and requester
- **⏹️ Stop** - Disconnect the bot from the voice channel

### Row 2: Premium Controls (Premium Servers Only)

These buttons appear only for servers with premium enabled:

- **🔁 Loop** - Cycle through loop modes: Off → Song → Queue → Off
- **🔊 Volume** - Cycle through volume levels: 50% → 75% → 100% → 125% → 150%
- **📝 Playlists** - View all saved playlists with song counts
- **📊 Stats** - Display music statistics for your server

## How to Use

1. **Play a Song**
   ```
   /play query: "song name"
   ```

2. **Use the Buttons**
   - The response will show an embed with buttons directly below it
   - Click any button to perform that action
   - Responses are ephemeral (only visible to you)

3. **Premium Features**
   - If your server has premium enabled, you'll see the second row of buttons
   - Non-premium servers will only see basic controls
   - Click `/premium-settings` to view your premium status

## Button Behaviors

### Skip Button
- Skips the currently playing song
- Advances to the next track in the queue
- Shows the skipped song title in the response

### Queue Button
- Displays the next 10 songs in the queue
- Shows total queue length at the bottom
- Helps you plan what's coming next

### Now Playing Button
- Shows the current song title
- Displays elapsed time and total duration
- Shows who requested the track

### Stop Button
- Disconnects the bot immediately
- Clears the player instance
- Cannot be undone in this interaction

### Loop Button (Premium)
- Cycles through three modes:
  - **None**: Normal queue playback
  - **Song**: Current track repeats indefinitely
  - **Queue**: Entire queue repeats after completion
- Changes persist until manually changed again

### Volume Button (Premium)
- Cycles through preset levels: 50%, 75%, 100%, 125%, 150%
- Volume applies to all songs in the queue
- Changes take effect on the next song

### Playlists Button (Premium)
- Lists all custom playlists for your server
- Shows song count for each playlist
- Use `/playlist` command to manage playlists

### Stats Button (Premium)
- Displays total songs played this session
- Shows your top 5 most-played songs
- Helps track music trends in your server

## Pro Tips

1. **Quick Control**: Use buttons instead of typing commands for faster music management
2. **Premium Features**: Upgrade to premium to unlock advanced controls
3. **Ephemeral Responses**: Button responses are only visible to the person who clicked them
4. **Role Restrictions**: If DJ Mode is enabled, only DJs can use buttons in that server
5. **Same Voice Channel**: You must be in the same voice channel as the bot to use buttons

## Requirements

- You must be in a voice channel
- You must be in the same voice channel as the bot
- The bot must be currently playing music
- Premium features require a premium server subscription

## Error Messages

| Error | Reason |
|-------|--------|
| "Not in voice channel" | You need to join a voice channel first |
| "Different voice channel" | Join the same voice channel as the bot |
| "No music playing" | The bot isn't currently playing anything |
| "Premium feature" | Your server needs premium for this button |

## Button Interaction Architecture

Each button triggers an interaction handler without reloading the message, providing instant feedback. Failed operations display an error message ephemenrally.

- **Handler File**: `events/interactionCreate/musicButtons.js`
- **Command File**: `commands/music/play.js`
- **Custom IDs**: All buttons use `music_` prefix (e.g., `music_skip`, `music_loop`)

---

For more information, visit the support server or use `/premium-settings` to manage your features!
