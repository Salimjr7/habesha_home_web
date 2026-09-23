import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor server configuration:
// For development on Android emulator: use http://10.0.2.2:3000
// For development on physical device: use your machine's LAN IP, e.g. http://192.168.1.100:3000
// For production: set CAPACITOR_SERVER_URL to your deployed production domain (e.g. https://ethiohome.et)
const liveServerUrl =
  process.env.CAPACITOR_SERVER_URL ||
  (process.env.NODE_ENV === "development" ? "http://10.0.2.2:3000" : undefined);

const config: CapacitorConfig = {
  appId: "com.ethiohome.app",
  appName: "EthioHome",
  webDir: "public",
  server: liveServerUrl
    ? {
        url: liveServerUrl,
        cleartext: true,
      }
    : {
        androidScheme: "https",
      },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0B132B",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#0B132B",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
