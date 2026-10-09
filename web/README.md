# ProgressX Web Version

Main file:

`ProgressX.html`

## Public demo behavior

The GitHub web build now starts with **demo data** matching the purpose/structure of:

`template/ProgressX-Template-Demo.xlsx`

That means a new visitor can open the HTML and immediately see sample workouts, sample foods, a sample food diary and default reminders **without using the owner's personal data or Sheet**.

The demo is local only until the user connects their own Apps Script URL.

To use real Google Sheet synchronization:

1. Upload `template/ProgressX-Template-Demo.xlsx` to Google Drive.
2. Convert it to Google Sheets.
3. Add `backend/Code.gs` and `backend/appsscript.json`.
4. Deploy Apps Script as a Web App.
5. Paste that user's own `/exec` URL into ProgressX Settings.

For full setup instructions, see:

**[../docs/WEB.md](../docs/WEB.md)**

For the Android APK version, see:

**[../docs/ANDROID.md](../docs/ANDROID.md)**
