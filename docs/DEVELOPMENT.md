# Development

Requires Docker Compose, Python 3.12+, Node.js 22.13+ for Expo SDK 58, and Android Studio/Android SDK API 37 for local Android builds. SDK 58 aligns React Native 0.88 and React 19.3. Expo Go is optional; the recommended Android workflow is a project development build. Copy `.env.example` to repo-root `.env` for Compose, then copy it to `mobile/.env` for Expo and replace `EXPO_PUBLIC_API_BASE_URL` with the host LAN IP visible to the phone; ensure firewall allows TCP 5000. Run `docker compose up --build -d`, then apply schema with `docker compose exec backend flask --app dad.py db upgrade` and seed via `docker compose exec backend python seed.py`. Stop with `docker compose down`; persistent DB volume remains. `docker compose down -v` removes local DB data.

## SDK 58 Android launch options

The earlier Metro failure came from a mixed install: the manifest had SDK 58 but `node_modules` still contained React Native 0.86 / Expo Router 57. The lockfile is now regenerated for SDK 58 and `expo-dev-client` is installed. Avoid `npm install --force` or using SDK 58 with the SDK 57 Expo Go binary.

**Local Android development build (best if Android Studio is installed):**

1. In `mobile/`, run `npm ci` and `npx expo install --check`.
2. Start/build once with `npm run android:dev` (this runs `expo run:android`, prebuilds the native Android project, compiles, installs, and starts Metro). To target a connected phone, use `npx expo run:android --device`.
3. For later JavaScript-only sessions, use `npm run start:dev-client`; open the installed DadsCars development app or press `a` for an Android emulator. Rebuild after SDK/native dependency or app-config changes.

**Cloud Android development build (if Android Studio/SDK is unavailable):** `npx eas-cli build:configure` once, then `npx eas-cli build --platform android --profile development`. Install the generated internal APK, then use `npm run start:dev-client`. This requires an Expo/EAS account and internet access; no build was started from this environment.

**Expo Go alternative:** Android can install a Go binary matching the project SDK from Expo’s SDK-specific downloads; the Play Store version can lag. Standard iOS Expo Go is limited to SDK 54, so SDK 58 iPhone testing needs a development build instead.

For schema changes, configure `FLASK_APP=dad.py`, then `flask db migrate -m "description"` and `flask db upgrade`; inspect generated migration before applying. Current seed uses create_all as a development convenience.
