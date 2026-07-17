# Android Build Guide

This project uses Capacitor 8 with the production site loaded from:

`https://delivery-theta-pink.vercel.app`

## Strategy

- The native Android app is a wrapper around the published Next.js app.
- `server.url` points to the Vercel production deployment.
- `webDir` is set to `dist-capacitor`, which contains a minimal fallback shell only.
- This is a first-step Android build for testing and internal distribution.

## Important limitation

Because the app loads the remote site, offline behavior, updates, and backend behavior are tied to the published Vercel deployment. Before a store release, this architecture should be revisited in favor of a local shell plus remote APIs.

## Commands

- `npm run cap:add:android`
- `npm run cap:sync`
- `npm run cap:open:android`
- `npm run android:build:debug`

## Debug APK

Output:

`android/app/build/outputs/apk/debug/app-debug.apk`

## Android prerequisites

- Node.js
- npm
- Java / JDK
- Android SDK
- Android build-tools
- platform-tools
- Android Studio

## Notes

- Use HTTPS only.
- Do not store credentials, tokens, or keystore secrets in this repository.
- `local.properties` stays untracked.
