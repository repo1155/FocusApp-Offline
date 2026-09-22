# FocusApp Offline

An offline-first focus timer built with Expo and React Native. Focus sessions, timer settings, history, and insights are stored locally on the device with AsyncStorage. The core app does not require an account, backend, or internet connection.

## Run locally

```bash
npm install
npx expo start
```

For a development preview in this workspace, use the configured Expo workflow.

## Android build outputs

The GitHub Actions workflow in `.github/workflows/android-build.yml` creates a native Android project, builds a release APK and release AAB, and uploads both as workflow artifacts.

After a successful run, the files are generated at:

```text
android/app/build/outputs/apk/release/app-release.apk
android/app/build/outputs/bundle/release/app-release.aab
```

The workflow also publishes a downloadable artifact bundle named `focusapp-android-builds` in the GitHub Actions run summary.

## GitHub Actions

The workflow runs on pushes to `main`, version tags, and manual dispatch:

```text
.github/workflows/android-build.yml
```

It uses Node.js 22, Java 17, and the Android SDK supplied by `ubuntu-latest`. The native `android/` directory is generated during CI with `expo prebuild`, so generated build files do not need to be committed.

## Features

- Configurable focus and break durations
- Start, pause, resume, and skip controls
- Optional Hard Focus mode that locks pause and skip during focus
- Session labels and local history
- Weekly focus insights
- Local data reset
- Custom app icon
- No network dependency for the core experience