# ProgressX Android V1

Android wrapper for the current ProgressX V51 web app.

## Included
- ProgressX V51 embedded as a local app asset.
- Google Apps Script / internet access.
- Persistent WebView localStorage.
- Camera permission support for barcode scanning.
- Secure local origin using `https://appassets.androidplatform.net`.
- Back button support.

## Build APK
1. Install Android Studio.
2. Open this folder as an existing project.
3. Let Gradle sync finish.
4. Connect an Android phone or use an emulator.
5. For a test APK: `Build > Build App Bundles or APKs > Build APKs`.
6. Android Studio will show the generated APK location.

## Release APK
Use:
`Build > Generate Signed App Bundle / APK > APK`
and create/choose your own signing key.

## Important
The current Google Apps Script endpoint is already embedded in the included V51 HTML.
If that endpoint changes later, replace `app/src/main/assets/index.html`
with the newer ProgressX HTML or edit the endpoint inside it, then rebuild the APK.

## Barcode camera
The app requests Android CAMERA permission only when the web scanner requests camera access.


## Build APK without Android Studio

This project includes a GitHub Actions workflow.

1. Create a new GitHub repository.
2. Upload the contents of this project.
3. Open the repository's **Actions** tab.
4. Select **Build ProgressX APK**.
5. Click **Run workflow**.
6. When the build finishes, download the **ProgressX-APK** artifact.
7. Inside it you will find `app-debug.apk`.

The workflow also runs automatically when app files change on the `main` branch.

## Branding

A custom ProgressX app icon is included in all Android density folders.
The master 1024×1024 icon is provided separately.
