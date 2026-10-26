#!/usr/bin/env bash
# Build a locally signed AAB using an existing external upload key. Never creates keys or uploads.
set -euo pipefail
umask 077

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
fail() { echo "$*" >&2; exit 1; }
[[ $# -eq 0 ]] || fail 'Usage: scripts/native-release-android.sh (settings come from environment variables).'

for signing_variable in HEROVERA_ANDROID_KEYSTORE HEROVERA_ANDROID_STORE_PASSWORD HEROVERA_ANDROID_KEY_ALIAS HEROVERA_ANDROID_KEY_PASSWORD EVERBLOOM_API_ORIGIN; do
  [[ -n "${!signing_variable:-}" ]] || fail "Missing $signing_variable. See docs/NATIVE_BETA.md."
done

command -v node >/dev/null || fail 'Node 22.12+ or 24+ is required.'
node <<'NODE'
const [major, minor] = process.versions.node.split('.').map(Number);
if (!(major >= 24 || (major === 22 && minor >= 12))) {
  console.error('Node 22.12+ or 24+ is required.'); process.exit(1);
}
try {
  const origin = new URL(process.env.EVERBLOOM_API_ORIGIN);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error();
} catch {
  console.error('EVERBLOOM_API_ORIGIN must be an HTTPS origin without path, credentials, query or fragment.'); process.exit(1);
}
NODE

export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
[[ -x "$ANDROID_HOME/platform-tools/adb" ]] || fail 'Android SDK missing. Set ANDROID_HOME to the installed SDK.'
java21="$(/usr/libexec/java_home -v 21 2>/dev/null)" || fail 'JDK 21 is required for the local Android release build.'
export JAVA_HOME="$java21"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# Check the key before spending time rebuilding assets. No passwords enter command-line arguments.
cd "$project_dir/frontend/android"
./gradlew --no-daemon --no-configuration-cache :app:validateReleaseSigning

cd "$project_dir/frontend"
npm run build
node scripts/configure-native.mjs
npx --no-install cap sync android

cd "$project_dir/frontend/android"
./gradlew --no-daemon --no-configuration-cache :app:bundleRelease

release_bundle="$project_dir/frontend/android/app/build/outputs/bundle/release/app-release.aab"
[[ -s "$release_bundle" ]] || fail 'Gradle finished without the expected release AAB.'
verification_output="$("$JAVA_HOME/bin/jarsigner" -J-Duser.language=en -J-Duser.country=US -verify "$release_bundle" 2>&1)" || fail 'AAB signature verification failed.'
[[ "$verification_output" == *'jar verified.'* ]] || fail 'The AAB has no verifiable JAR signature.'
echo "Signed local AAB: $release_bundle"
echo 'No upload performed. Store configuration, version acceptance and real-device testing are separate checks.'
