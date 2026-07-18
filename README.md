# Song Duplicate Finder

A lightweight local duplicate detection app for lyrics files using Python, SQLite, and a React-based review UI.

## Features

- Scan a lyrics folder for duplicate songs across `.txt` files
- Save duplicate groups to a local SQLite database (`duplicates.db`)
- Review duplicate song files side by side in a browser UI
- Delete duplicate files from disk directly from the UI
- Define a match threshold for duplicate detection

## Run the app

1. Open a terminal in `/Users/korede/dev/songs-db`
2. Run:

```bash
./.venv/bin/python server.py
```

3. Open `http://localhost:8000` in your browser.

## Usage

- Set the directory path to the lyrics folder (default: `lyrics`)
- Adjust the threshold slider
- Click **Scan for duplicates**
- Review groups and delete duplicate files as needed

## Notes

- The app compares lyrics by normalizing the text and computing a similarity score using both line and full-text matching.
- Duplicate groups are stored in `duplicates.db` so you can refresh the review UI later.
- The Cloudflare Worker migration uses an upload-then-process flow, deletes the uploaded archive after ingest, and keeps the generated deduplicated archive available through an expiring download link.
