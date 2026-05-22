═══════════════════════════════════════════════════════════════════
  YouTube Playlist Importer
  Manual and description (EN)
═══════════════════════════════════════════════════════════════════

  Other languages:  Readme.RU.txt (Русский) · Readme.UA.txt (Українська)


┌─────────────────────────────────────────────────────────────────┐
│  WHAT THIS SCRIPT IS FOR                                         │
└─────────────────────────────────────────────────────────────────┘

It migrates playlists from an old YouTube account to a new one.

YouTube/Google does not provide a built-in playlist import tool.
If you want to move your playlists to a new account, the only
official path is to export them via Google Takeout as CSV files
and then re-create everything by hand.

This script automates the "by hand" part. It takes Takeout CSVs,
creates playlists in your current (target) YouTube account, and
fills them with videos — using the same internal API that the
youtube.com page itself uses.

No need for:
  • API keys or registering an app in Google Cloud
  • OAuth tokens
  • installing anything
  • uploading data to third-party services

Everything runs locally in the browser, on the cookies of your
current YouTube session.

UI is available in three languages: EN / RU / UA. Use the
language buttons in the top-right corner of the window. The
language is auto-detected from the browser and remembered
between runs.


┌─────────────────────────────────────────────────────────────────┐
│  FEATURES                                                        │
└─────────────────────────────────────────────────────────────────┘

  • Upload one or many CSV files via drag-and-drop or file picker.
  • Create playlists with arbitrary names (taken from the file
    name from Takeout).
  • Auto-recognition of "Watch later" / "Смотреть позже" /
    "Дивитися пізніше" — such files go to the system Watch Later
    instead of creating a same-named regular playlist.
  • Privacy of created playlists:
        — Private (only you)
        — Unlisted (with link)
        — Public
  • Configurable delay between requests (100 ms – 60 s), with
    presets: 0.5 / 0.7 / 3 / 10 / 15 seconds.
  • Configurable batch size (1–50 videos per request).
  • Progress bar with ETA, video counter, and a live operations log.
  • Stop button at any time.
  • Automatic per-video retry if a batch fails as a whole — so
    that a single broken video doesn't drop its 19 neighbors.
  • Rate-limit (HTTP 429) handling: auto-pause 30–60 seconds and
    continue.
  • Distinction between error types:
        ⊘ "unavailable" — video deleted, private, region-blocked,
          age-restricted, or the author disabled adding to playlists
          (HTTP 400, FAILED_PRECONDITION)
        ✗ "errors"      — everything else (network, unknown codes)
  • Detailed final report in the window:
        — overall stats (added / unavailable / errors)
        — per-playlist breakdown
        — clickable list of failed videos
        — "Copy list" / "Download TXT" buttons
  • Mirror report in the browser console (with console.table for
    easy data work).
  • Fully localized UI and logs in three languages.


┌─────────────────────────────────────────────────────────────────┐
│  WHERE TO GET THE CSV FILES                                      │
└─────────────────────────────────────────────────────────────────┘

  1. Go to https://takeout.google.com signed into the OLD account
     (the one you are migrating FROM).

  2. Click "Deselect all" — to avoid downloading everything.

  3. Find "YouTube and YouTube Music" in the list, check it.

  4. Click "All YouTube data included" under it →
     uncheck all → leave only "Playlists" → OK.

  5. Scroll down → "Next step" → choose format and delivery
     method → "Create export".

  6. Wait for the email (minutes to an hour) → download the
     archive → unpack.

  7. Inside, find the "YouTube and YouTube Music / playlists"
     folder — there will be files like:
        "playlist videos _Playlist name_.csv"

These CSV files are what you feed to the script.


┌─────────────────────────────────────────────────────────────────┐
│  CSV FORMAT AND PLAYLIST NAME                                    │
└─────────────────────────────────────────────────────────────────┘

The script expects CSVs in Google Takeout format:

    Video ID,Playlist Video Creation Timestamp
    dQw4w9WgXcQ,2024-01-15T10:00:00+00:00
    9bZkp7q19f0,2024-01-15T10:05:00+00:00
    ...

The first row is a header and is skipped. From each subsequent
row, the first column (video ID) is taken; everything after the
comma is ignored. Empty lines are skipped.

The playlist name is derived from the file name:
  • If the name contains a section between underscores like _NAME_,
    NAME is used as the playlist name.
    Example:  "playlist videos _My top_.csv" → "My top"
  • Otherwise the file name (without extension) is used.

If the playlist name (case-insensitive) equals "watch later",
"смотреть позже", "посмотреть позже", "дивитися пізніше", or
"дивитись пізніше" — videos go into the target account's system
Watch Later instead of creating a new playlist with that name.


┌─────────────────────────────────────────────────────────────────┐
│  HOW TO RUN                                                      │
└─────────────────────────────────────────────────────────────────┘

  1. Sign into the new YouTube account (the one you are moving TO).
     Verify the avatar in the top-right corner is the correct one.

  2. Open https://www.youtube.com/ — any page (the home page
     works fine).

  3. Press F12 → go to the "Console" tab.

  4. If the console warns "Don't paste anything here" — type
     manually:
            allow pasting
     and press Enter. (This is a self-XSS protection in Chrome/
     YouTube.)

  5. Open the  import-playlists.js  file in any editor
     (Notepad / VS Code / whatever), select everything
     (Ctrl+A) and copy (Ctrl+C).

  6. Paste into the console (Ctrl+V) and press Enter.

  7. A modal window appears in the center of the page. Switch
     language with the EN / RU / UA buttons in the header if
     needed. Drag CSV files onto it or click the upload area
     and pick them.

  8. Tune the delay and privacy.

  9. Click "Start import" and wait until it finishes. The window
     shows progress, log, and at the end — the final report.


┌─────────────────────────────────────────────────────────────────┐
│  HOW TO CHOOSE THE DELAY                                         │
└─────────────────────────────────────────────────────────────────┘

YouTube does not publish official rate limits, so recommendations
are empirical:

  Playlist size          Safe delay
  ──────────────────     ───────────────────
  up to 50 videos        500–700 ms
  50–200 videos          1–3 seconds
  200–500 videos         5–10 seconds
  500+ videos            10–15 seconds
                         or split into several sessions

Higher delay = slower but safer.

At too high a speed you may hit:
  • Temporary rate-limit (HTTP 429). The script handles this
    automatically by pausing 30–60 seconds.
  • A CAPTCHA on the site. Solve it manually in the tab —
    the script will continue with the next request.
  • A 24-hour temporary account action limit.

In extremely rare cases mass automated requests can cause an
account to be blocked.

╔══════════════════════════════════════════════════════════════╗
║  Use at your own risk. For your main account use a 10–15     ║
║  second delay and don't try to import everything in one go.  ║
╚══════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────┐
│  WHAT TO DO ABOUT FAILED VIDEOS                                  │
└─────────────────────────────────────────────────────────────────┘

The report splits failed videos into two categories:

  ⊘ UNAVAILABLE
    Server returned HTTP 400 / FAILED_PRECONDITION. It means the
    video cannot be added to a playlist. Reasons:
        — deleted by author or YouTube;
        — turned private;
        — region-blocked in your country;
        — age-restricted
          (and your new account has no verified age);
        — author disabled adding to playlists.
    Nothing you can do about these — they are lost.
    Opening the link will show "Video unavailable" or similar.

  ✗ ERRORS
    Everything else: network errors, unknown codes, rate-limits
    that retries didn't survive. It makes sense to retry these
    specific videos.

The report has buttons:
  📋 Copy list    — puts all failed videos in the clipboard as
                    "[Playlist] URL Reason".
  💾 Download TXT — saves the same list as failed-videos.txt.


┌─────────────────────────────────────────────────────────────────┐
│  FAQ                                                             │
└─────────────────────────────────────────────────────────────────┘

? Is this safe for the account?
  The script uses the same API as the youtube.com page itself,
  with your own cookies. From the server's point of view it
  looks like very active site use. With a reasonable delay
  (≥1 second) problems are uncommon. To be extra safe, run with
  10+ seconds and don't try to import everything in one session.

? What about duplicates in playlists?
  YouTube allows duplicates — if a video is already in a playlist,
  it will be added again. If you don't want this, remove
  duplicates from the CSV beforehand.

? Can I import into an EXISTING playlist?
  Not in this version. The script always creates a new playlist
  with the name from the file. Watch Later is the exception
  (it's the system WL playlist, always appended to).

? If I stop mid-import — will it resume next time?
  No, the script creates playlists fresh each run. Before re-running,
  delete the partially created playlists manually or rename the
  files.

? Where are results after I close the modal?
  In the  window.__importResult  variable in the console. Available
  until you reload the page. You can copy as JSON via:
            copy(JSON.stringify(window.__importResult, null, 2))

? Can I change language during the import?
  No. Language buttons are locked the moment you click "Start
  import" and stay locked through the final report — so the
  report and the log remain in a single, consistent language.
  To switch language again, click "↺ New import" on the done
  screen to return to the setup stage.

? How do I remove a CSV file I uploaded by mistake?
  Each file row has a × button on the right. Click it to drop
  that file from the queue without affecting the others.

? Can I run another import without closing the modal?
  Yes. When the import finishes, the primary button becomes
  "↺ New import". Clicking it clears the file list, log and
  progress, and brings you back to the setup stage.

? The script won't start, says "Could not read INNERTUBE_API_KEY".
  Open the actual main page at https://www.youtube.com/
  (not Studio, not Music). On some pages ytcfg is not available.

? The window did not appear after pasting into the console.
  You're probably not on youtube.com, or there is an error in
  the console — look for red messages. It's also possible you
  pasted only part of the file — copy again with Ctrl+A → Ctrl+C.

? Can I import from multiple old accounts at once?
  Yes, load all CSVs in one session — just make sure the playlist
  names don't collide (otherwise one will overwrite the other in
  the upload list).


┌─────────────────────────────────────────────────────────────────┐
│  TECHNICAL DETAILS                                               │
└─────────────────────────────────────────────────────────────────┘

YouTube InnerTube API endpoints used by the script:

  POST /youtubei/v1/playlist/create
       — create a new playlist (with one initial video)

  POST /youtubei/v1/browse/edit_playlist
       — add videos to a playlist (including the system WL)

Authentication:
  SAPISIDHASH = SHA-1(timestamp + ' ' + SAPISID + ' ' + origin)
  Header Authorization: SAPISIDHASH <ts>_<hash>
  Same mechanism as used by the YouTube page itself.

Cookies are used only from the current browser session (via
credentials: 'include'). No data is sent anywhere except to
www.youtube.com.

Settings storage:
  localStorage['yt-importer-lang'] — the chosen UI language.
  No other data is stored by the script.

Compatibility with YouTube's Trusted Types CSP:
  All DOM is built via document.createElement + appendChild,
  no innerHTML / DOMParser / other HTML-parsing sinks.


┌─────────────────────────────────────────────────────────────────┐
│  LICENSE AND DISCLAIMER                                          │
└─────────────────────────────────────────────────────────────────┘

Do whatever you want with this script.

The author is NOT responsible for any blocking, limitation, or
other sanctions from YouTube / Google against your account, nor
for lost playlists or any other possible consequences of using
this script.

The YouTube InnerTube API is not public and may change or be
shut down at any moment without warning. If the script suddenly
stops working — most likely YouTube changed the request format.

═══════════════════════════════════════════════════════════════════
