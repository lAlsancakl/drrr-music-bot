
# Usage Instructions for the Drrr-Music-Bot

## Play music by name

To play music by searching a song name, send this command in the chat:

```
/play <music name>
```

**Example:**

```
/play Never Gonna Give You Up
```

The bot will search for the song, download the audio, and start playing it in the room.

---

## Play music from a direct URL

To play music from a direct YouTube (or supported site) URL, use this command:

```
/play -url <video URL>
```

**Example:**

```
/play -url https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

The bot downloads the video, converts it to MP3, and plays it in the room.

---

## Using ffmpeg with the Bot

The bot requires `ffmpeg` to process audio streams.

Make sure you have the folder `ffmpeg-7.1.1-full_build-shared` placed in the same directory as `foreground.js`.  
The bot uses this folder to locate the ffmpeg binaries necessary for converting videos to MP3 format.

> **Note:**  
> - If ffmpeg is not correctly installed or the folder is missing, audio processing will fail.  
> - Make sure the ffmpeg executable inside this folder has proper permissions.

---

## HTTPS Setup with DuckDNS

The bot's backend only accepts HTTPS requests for security reasons.  
This means you **cannot** use `http://` URLs directly for the DuckDNS domain.

To enable HTTPS on your DuckDNS domain (`your-domain.duckdns.org`), follow these steps:

1. Obtain SSL/TLS certificates for your DuckDNS domain using Let's Encrypt or a similar service.  
2. Install the certificate files (`privkey.pem` and `fullchain.pem`) on your server.  
3. Configure your server to serve HTTPS requests with these certificates.  
4. Update your bot configuration to use the `https://your-domain.duckdns.org` URL instead of `http`.

This ensures secure communication between the bot and the music server, preventing insecure requests.

---

## Other things I want to say

Untick the setting **"Allow only music casted from verified URL"**  
This will result in safer, less IP tracking during usage.

This bot functions as a browser extension, so you need to add it through your browser's extensions page
