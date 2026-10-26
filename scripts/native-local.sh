#!/usr/bin/env bash
# Local native toolchain only: never changes global Java/Xcode settings or signs a release.
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
mode="${1:-doctor}"

fail() { echo "$*" >&2; exit 1; }
configure_android() {
  export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
  [[ -x "$ANDROID_HOME/platform-tools/adb" ]] || fail "Android SDK fehlt: ANDROID_HOME auf dein installiertes SDK setzen."
  local java21
  java21="$(/usr/libexec/java_home -v 21 2>/dev/null)" || fail "Java 21 fehlt. Installiere ein JDK 21, bevor du Android baust."
  export JAVA_HOME="$java21"
  export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
}
configure_ios() {
  export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
  [[ -x "$DEVELOPER_DIR/usr/bin/xcodebuild" ]] || fail "Vollständiges Xcode fehlt; die Command Line Tools reichen nicht."
  /usr/bin/xcrun --find simctl >/dev/null
}
case "$mode" in
  doctor)
    configure_android
    configure_ios
    "$JAVA_HOME/bin/java" -version
    "$ANDROID_HOME/platform-tools/adb" version
    "$ANDROID_HOME/emulator/emulator" -list-avds
    "$DEVELOPER_DIR/usr/bin/xcodebuild" -version
    "$DEVELOPER_DIR/usr/bin/xcodebuild" -checkFirstLaunchStatus
    /usr/bin/xcrun simctl list runtimes
    if command -v node >/dev/null; then
      node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (!(major >= 24 || (major === 22 && minor >= 12))) { console.error("Node 22.12+ oder 24+ aktivieren: aktuell " + process.version); process.exit(1); } console.log("Node " + process.version);'
    else
      fail "Node fehlt. Das Projekt benötigt Node 22.12+ oder 24+."
    fi
    /usr/bin/xcrun simctl list runtimes -j | node -e 'let text = ""; process.stdin.on("data", data => text += data); process.stdin.on("end", () => { const runtimes = JSON.parse(text).runtimes ?? []; if (!runtimes.some(runtime => runtime.isAvailable && runtime.identifier.includes(".iOS-"))) { console.error("Keine verfügbare iOS-Simulator-Runtime. In Xcode > Settings > Components installieren."); process.exit(1); } });'
    echo 'Toolchain und iOS-Runtime vorhanden. Doctor beweist weder Signing noch Geräte- oder Serverabnahme.' 
    ;;
  android-debug)
    configure_android
    cd "$project_dir/frontend/android"
    ./gradlew assembleDebug
    echo "Debug-APK: $project_dir/frontend/android/app/build/outputs/apk/debug/app-debug.apk"
    ;;
  ios-simulator)
    configure_ios
    mkdir -p "$project_dir/.local/ios-derived-data"
    "$DEVELOPER_DIR/usr/bin/xcodebuild" -project "$project_dir/frontend/ios/App/App.xcodeproj" \
      -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
      -derivedDataPath "$project_dir/.local/ios-derived-data" CODE_SIGNING_ALLOWED=NO build
    echo "Simulator-App: $project_dir/.local/ios-derived-data/Build/Products/Debug-iphonesimulator/App.app"
    ;;
  *) fail 'Verwendung: scripts/native-local.sh doctor | android-debug | ios-simulator' ;;
esac
