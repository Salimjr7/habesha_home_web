import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor server configuration for EthioHome:
//
// The Next.js app uses server-side rendering (Prisma, sessions, API routes),
// so Capacitor must point the webview at a running Next.js server.
//
// For LOCAL development: set CAPACITOR_SERVER_URL to http://<YOUR_LAN_IP>:3000
//   then run: npm run dev -- --hostname 0.0.0.0
//   then run: npx cap sync android
//
// For PRODUCTION: deploy your Next.js app and set CAPACITOR_SERVER_URL to
//   your production domain (e.g. https://ethiohome.et)

const serverUrl =
  process.env.CAPACITOR_SERVER_URL || "http://192.168.0.100:3000";

const config: CapacitorConfig = {
  appId: "com.ethiohome.app",
  appName: "EthioHome",
  webDir: "out",
  server: {
    url: serverUrl,
    cleartext: true,
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
