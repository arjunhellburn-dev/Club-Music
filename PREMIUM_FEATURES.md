# PlumpyMusic Premium Features Guide

## Overview
This document outlines all premium features available for the PlumpyMusic bot. Premium features enhance the music experience and give server administrators more control over how music is played.

---

## 📋 Premium Features

### 1. **Stay Connected** 
**Command:** `/stay-connected`

Keep the bot in the voice channel even when everyone leaves. This prevents the bot from disconnecting and allows seamless resumption of music when members rejoin.

**Usage:**
- `/stay-connected enabled: true` - Enable the feature
- `/stay-connected enabled: false` - Disable the feature

**Benefits:**
- No need to rejoin for continuous music
- Saves the current queue and playback state

---

### 2. **DJ Mode** 
**Command:** `/dj-mode`

Restrict music commands to members with a specific role. Perfect for larger servers where you want only designated DJs to control the music.

**Subcommands:**
- `/dj-mode set role: @DJ` - Set a role as DJ
- `/dj-mode remove` - Remove DJ role restriction

**Benefits:**
- Maintain order in music playback
- Prevent spam commands in voice channels
- Allow selected moderators to manage music

---

### 3. **Song Announcements** 
**Command:** `/announcements`

Announce when songs start or end in a dedicated channel. Great for highlighting what's currently playing.

**Subcommands:**
- `/announcements enable channel: #music-announcements` - Enable announcements in a channel
- `/announcements disable` - Turn off announcements

**Features:**
- Automatic notifications when tracks begin/end
- Clean embeds with song information
- Customizable announcement channel

---

### 4. **Volume Control** 
**Command:** `/volume`

Set a custom audio volume for your server (1-200%). This volume applies to all songs played in your guild.

**Usage:**
- `/volume level: 100` - Set to 100% (default)
- `/volume level: 150` - Increase to 150%
- `/volume level: 50` - Reduce to 50%

**Benefits:**
- Adjust audio levels without external tools
- Persist across different songs
- Range from quiet (1%) to loud (200%)

---

### 5. **Loop Modes** 
**Command:** `/loop`

Control how music repeats during playback.

**Modes:**
- **None** - Queue plays normally without looping
- **Song** - Current track repeats until changed
- **Queue** - Entire queue repeats after completion

**Usage:**
- `/loop mode: none` - Disable looping
- `/loop mode: song` - Loop current song
- `/loop mode: queue` - Loop entire queue

**Benefits:**
- Continuous ambient music with queue loop
- Practice or focus with song loop
- Control playback behavior seamlessly

---

### 6. **Custom Playlists** 
**Command:** `/playlist`

Save and manage custom playlists for frequent song combinations.

**Subcommands:**
- `/playlist create name: "Gaming"` - Create a new playlist
- `/playlist add name: "Gaming"` - Add current song to playlist
- `/playlist list` - View all playlists
- `/playlist delete name: "Gaming"` - Delete a playlist

**Features:**
- Unlimited playlists per server
- Easy song management
- Quick access to favorite tracks

---

### 7. **Song Requests** 
**Command:** `/song-requests`

Allow server members to request songs through a dedicated channel or command.

**Subcommands:**
- `/song-requests enable channel: #requests` - Enable requests in a channel
- `/song-requests disable` - Disable requests

**Benefits:**
- Democratic music selection
- Community-driven playlists
- Organized request management

---

### 8. **Music Statistics** 
**Command:** `/stats`

Track and view music statistics for your server.

**Displays:**
- Total songs played
- Top 10 most played songs
- Play count per song

**Benefits:**
- See what music is popular in your server
- Track bot usage
- Find trending songs among members

---

### 9. **Premium Settings Dashboard** 
**Command:** `/premium-settings`

View an overview of all premium features and their current status in one place.

**Shows:**
- Status of each premium feature
- Current configurations
- Associated roles/channels

**Benefits:**
- Quick settings overview
- Easy feature management
- One-command configuration check

---

## 🚀 Quick Start

1. **Verify Premium Status:**
   ```
   /premium-settings
   ```

2. **Set Up DJ Mode (Optional):**
   ```
   /dj-mode set role: @DJ
   ```

3. **Enable Announcements (Optional):**
   ```
   /announcements enable channel: #music-announcements
   ```

4. **Adjust Volume (If Needed):**
   ```
   /volume level: 100
   ```

5. **Create Playlists:**
   ```
   /playlist create name: "Chill Vibes"
   ```

6. **Check Settings Anytime:**
   ```
   /premium-settings
   ```

---

## 💡 Tips & Tricks

- **DJ Mode + Announcements:** Perfect combination for controlled, transparent music management
- **Playlists + Auto-Loop:** Create themed playlists and loop them for consistent ambiance
- **Song Requests + Announcements:** Let members request songs and announce them publicly
- **Statistics:** Monitor which songs are loved by your community

---

## Support

For issues or feature requests, visit the support server:
🔗 https://discord.gg/689PYf8C8B

Enjoy your premium music experience!
