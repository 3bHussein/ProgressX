# ProgressX Setup

## 1. Create your Google Sheet
Upload `template/ProgressX-Template-Demo.xlsx` to Google Drive and open it as a Google Sheet. The rows marked **DEMO** are examples only; delete them when you are ready for real data.

## 2. Add the Apps Script backend
From the Sheet: **Extensions → Apps Script**.

- Replace `Code.gs` with `backend/Code.gs`.
- Enable **Show appsscript.json manifest file in editor** in Project Settings.
- Replace the manifest with `backend/appsscript.json`.
- Run `testProgressXPermissions()` once and approve the requested permissions.

## 3. Deploy
Choose **Deploy → New deployment → Web app**:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the `/exec` URL.

## 4. Connect ProgressX
Open `web/ProgressX.html`, go to **Settings**, paste the Apps Script `/exec` URL and save.

## 5. Android APK with GitHub Actions
Open the repository **Actions** tab → **Build ProgressX APK** → **Run workflow**. After the job succeeds, download the **ProgressX-APK** artifact.

## Notes
- Barcode and packaged-food search use Open Food Facts.
- Common-food search works locally and prioritizes common foods before packaged products.
- Nutrition data is an estimate; verify labels when precision matters.
- Each user should use their own Google Sheet and Apps Script deployment.
