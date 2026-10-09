# ProgressX Android APK Guide

ProgressX Android is a native Android WebView wrapper around the same ProgressX HTML interface.

The Android project lives in:

`android/`

The embedded HTML file is:

`android/app/src/main/assets/index.html`

## How Android data works

The APK stores ProgressX local data in Android WebView application storage.

Therefore:

- closing the app keeps the data;
- reopening the app keeps the data;
- restarting the phone keeps the data;
- updating the APK over the existing installation normally keeps the data;
- uninstalling the app removes the local Android copy;
- Android **Clear storage / Clear data** removes the local copy.

The current APK also contains the Google Sheets sync logic from ProgressX HTML.

So the current Android version is:

**Local Android storage + optional Google Sheet sync**

## Build APK without Android Studio

This repository contains:

`.github/workflows/android-build.yml`

### Step 1

Open the GitHub repository.

### Step 2

Click **Actions**.

### Step 3

Open:

**Build ProgressX APK**

### Step 4

Click:

**Run workflow → Run workflow**

### Step 5

Wait until the run turns green.

### Step 6

Open the successful workflow run.

### Step 7

Scroll to **Artifacts**.

Download:

**ProgressX-APK**

### Step 8

Extract the downloaded ZIP.

You will find:

`app-debug.apk`

### Step 9

Transfer the APK to your Android phone and open it.

Android may ask you to allow installation from that browser or file manager.

## Camera / barcode

ProgressX requests Android camera permission when the barcode scanner needs it.

The Android wrapper uses a secure local WebView origin so browser camera APIs can work inside the app.

## Google Sheets sync in Android

Because the APK embeds ProgressX HTML, the Apps Script endpoint used inside the embedded HTML controls Google Sheet sync.

If the APK was built with an Apps Script URL already embedded, it will use that URL.

For a public template, each user should preferably use their own Apps Script endpoint.

## Updating the Android app

When a new ProgressX HTML version is ready:

1. replace `android/app/src/main/assets/index.html` with the new HTML;
2. keep the same Android `applicationId`:
   `com.progressx.app`
3. commit the change;
4. run the GitHub Action again;
5. install the new APK over the old version.

Keeping the same application ID is important for Android to treat it as the same app.

## Current build stack

- Java 17
- Gradle 8.9
- Android compileSdk 35
- Android targetSdk 35
- GitHub Actions cloud build

## Build troubleshooting

### Duplicate Kotlin classes

The Android app uses Kotlin BOM alignment in `android/app/build.gradle` to keep Kotlin dependency versions compatible.

### Android plugin not found

The root file `android/build.gradle` must declare the Android Gradle Plugin version.

### APK artifact missing

Check that the build completed successfully and that this file exists:

`android/app/build/outputs/apk/debug/app-debug.apk`

---

Back to the main project: [README](../README.md)
