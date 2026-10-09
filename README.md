# ProgressX
### Train. Track. Progress.

ProgressX is a workout + nutrition tracker available in **two forms inside this same repository**:

1. **Web / HTML version** — open `web/ProgressX.html` in a browser.
2. **Android APK version** — built from the `android/` project using GitHub Actions.

Both versions use the same ProgressX interface and can use the same Google Sheets + Apps Script backend.

> Important: the current Android APK embeds the same ProgressX HTML app, so it also supports Google Sheet sync. In addition, Android WebView keeps local app data on the phone between launches.

---

## What ProgressX includes

- Workout logging
- Progressive overload analysis
- Estimated 1RM trends
- Nutrition diary
- Food Library
- Barcode lookup
- Smart Food Search
- Calories / Protein / Carbs / Fat tracking
- Daily supplement reminders
- Water tracking
- TDEE calculator
- Macro calculator
- BMI calculator
- 1RM calculator
- Training volume calculator
- Hydration calculator
- JSON backup / restore
- Google Sheets synchronization
- Android APK build workflow

---

## Choose how you want to use ProgressX

| Version | Runs on | Local storage | Google Sheet sync | Internet required |
|---|---|---|---|---|
| Web / HTML | Browser | Yes | Yes, when connected | Only for sync / online food search |
| Android APK | Android phone | Yes, inside app data | Yes, when connected | Only for sync / online food search |

### Where is data stored?

**Web version**
- ProgressX keeps local browser data for speed and offline continuity.
- When Apps Script is configured, supported data is synchronized with your Google Sheet.

**Android APK**
- Local ProgressX data is stored in Android WebView app storage under the ProgressX app.
- Closing the app or restarting the phone does **not** remove it.
- Uninstalling ProgressX or clearing app storage removes the local copy.
- The current APK still contains Google Sheet sync, so synchronized data can also exist in the user's own Google Sheet.

---

## Screenshots

| Home | Workout Log | Progress |
|---|---|---|
| ![Home](screenshots/01-home.png) | ![Workout Log](screenshots/02-log.png) | ![Progress](screenshots/03-progress.png) |

| Food | Daily | Calculators |
|---|---|---|
| ![Food](screenshots/04-food.png) | ![Daily](screenshots/05-daily.png) | ![Calculators](screenshots/06-calculators.png) |

### Smart Food Search

![Smart Food Search](screenshots/08-smart-food-search.png)

### Settings

![Settings](screenshots/07-settings.png)

---

# Option A — Web / HTML version

Full guide: **[docs/WEB.md](docs/WEB.md)**

Quick setup:

1. Download or clone this repository.
2. Upload `template/ProgressX-Template-Demo.xlsx` to Google Drive.
3. Open it as Google Sheets.
4. From the Sheet, open **Extensions → Apps Script**.
5. Paste `backend/Code.gs`.
6. Enable the manifest file and paste `backend/appsscript.json`.
7. Run `testProgressXPermissions()` once and approve permissions.
8. Deploy as a Web App:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Copy the Apps Script `/exec` URL.
10. Open `web/ProgressX.html`.
11. Open **Settings** and paste the `/exec` URL.
12. Test Workout, Food, Reminder and Nutrition sync.

---

# Option B — Android APK

Full guide: **[docs/ANDROID.md](docs/ANDROID.md)**

You do **not** need Android Studio.

1. Open this repository on GitHub.
2. Open **Actions**.
3. Select **Build ProgressX APK**.
4. Click **Run workflow**.
5. Wait for a green successful run.
6. Open the completed run.
7. Download the **ProgressX-APK** artifact.
8. Extract the ZIP.
9. Install `app-debug.apk` on Android.

The Android project is located in:

`android/`

The embedded ProgressX web app is located in:

`android/app/src/main/assets/index.html`

If you update the web app and want the APK to contain the same version, copy the new HTML into that path and rebuild the APK.

---

## Google Sheet template

The template workbook is:

`template/ProgressX-Template-Demo.xlsx`

It contains **demo data only** and is designed to show the correct structure.

Expected sheets include:

- Workout Log
- Program
- Reminders
- Daily Log
- Food Products
- Food Log
- Nutrition Settings

Each person should use their **own** Google Sheet and Apps Script deployment.

---

## Repository structure

```text
ProgressX/
├── .github/
│   └── workflows/
│       └── android-build.yml
├── android/
│   └── app/
│       └── src/main/assets/index.html
├── assets/
├── backend/
│   ├── Code.gs
│   └── appsscript.json
├── docs/
│   ├── SETUP.md
│   ├── WEB.md
│   └── ANDROID.md
├── screenshots/
├── template/
│   └── ProgressX-Template-Demo.xlsx
├── web/
│   ├── ProgressX.html
│   └── README.md
├── LICENSE
└── README.md
```

---

## Privacy

ProgressX does not require one central shared user database.

For the public template:
- each user should create their own Google Sheet;
- each user should create their own Apps Script deployment;
- users should not share private Apps Script URLs or personal Sheet data in the repository.

---

## License

MIT
