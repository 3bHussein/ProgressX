# ProgressX Web / HTML Setup

This guide explains how to run ProgressX as a normal HTML app with Google Sheets synchronization.

## 1. Download ProgressX

Download the repository or clone it.

The web app is:

`web/ProgressX.html`

Do not edit `android/app/src/main/assets/index.html` when you only want to use the browser version.

## 2. Create your Google Sheet

Use the included template:

`template/ProgressX-Template-Demo.xlsx`

Upload it to Google Drive and open it as Google Sheets.

The sample rows are only examples. Delete the rows marked **DEMO** before real use if you want a clean database.

## 3. Add Apps Script

From the Google Sheet:

**Extensions → Apps Script**

Replace the script with:

`backend/Code.gs`

Then open **Project Settings** and enable:

**Show "appsscript.json" manifest file in editor**

Replace the manifest contents with:

`backend/appsscript.json`

## 4. Authorize ProgressX

Run:

`testProgressXPermissions()`

Approve the Google permissions.

This is needed for:
- Google Sheets access
- external requests used for barcode / packaged-food lookup

## 5. Deploy Apps Script

Open:

**Deploy → New deployment → Web app**

Use:

- Execute as: **Me**
- Who has access: **Anyone**

Deploy and copy the URL ending in:

`/exec`

## 6. Connect the HTML app

Open:

`web/ProgressX.html`

Go to:

**Settings → Apps Script URL**

Paste the `/exec` URL and save.

## 7. Test the connection

Test all of these:

- add a workout;
- edit a workout;
- delete a workout;
- add a Food Library product;
- add a food diary entry;
- mark a reminder complete;
- save nutrition targets;
- scan / search a food product.

Then check the Google Sheet and confirm the corresponding rows appear.

## 8. Local data

ProgressX also stores local data in the browser.

This allows the UI to feel fast and lets data remain available between page openings on the same browser profile.

Browser storage can be removed if:
- browser site data is cleared;
- private/incognito mode is used and closed;
- the browser profile is removed.

## 9. Updating the web version

Replace `web/ProgressX.html` with the newer ProgressX HTML.

If the backend API changes, also update `backend/Code.gs` and deploy a new Apps Script version.

## Troubleshooting

### Unknown action

Example:

`Unknown action: food_search_online`

The deployed Apps Script is older than the HTML version.

Update `backend/Code.gs`, then:

**Deploy → Manage deployments → Edit → New version → Deploy**

### UrlFetchApp permission error

Run `testProgressXPermissions()` from Apps Script and approve permissions.

### Data appears locally but not in the Sheet

Check:
- Apps Script `/exec` URL
- deployment permissions
- network connection
- Apps Script version

---

Back to the main project: [README](../README.md)
