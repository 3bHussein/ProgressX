# ProgressX Complete Setup

ProgressX can be used in two ways from the same repository.

## Option A — Web / HTML

Use:

`web/ProgressX.html`

Full instructions:

**[WEB.md](WEB.md)**

This version stores local browser data and can synchronize supported records to the user's own Google Sheet.

## Option B — Android APK

Use the Android project:

`android/`

Full instructions:

**[ANDROID.md](ANDROID.md)**

The APK stores local data inside Android app storage and currently also contains the Google Sheet synchronization logic.

## Shared backend setup

Both versions can use:

- `template/ProgressX-Template-Demo.xlsx`
- `backend/Code.gs`
- `backend/appsscript.json`

Recommended public-template workflow:

1. Copy the Excel template into a personal Google Sheet.
2. Install the Apps Script backend.
3. Authorize it.
4. Deploy it as a Web App.
5. Use that user's own `/exec` URL.

Do not share a private personal Sheet as the database for every public user.
