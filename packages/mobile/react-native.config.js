/**
 * Skip ClerkExpo native iOS module. It pulls ClerkKit/ClerkKitUI via SPM and
 * breaks `pod install` with useFrameworks: static (target nil in RN spm.rb).
 * Auth uses the JS Clerk SDK + custom screens; native Clerk UI is unused.
 *
 * Skip expo-secure-store on iOS: TurboModule init hangs on iOS 26; tokens use
 * in-memory cache on iOS (see utils/token-cache.ts).
 */
module.exports = {
  dependencies: {
    "@clerk/expo": {
      platforms: {
        ios: null,
      },
    },
    "expo-secure-store": {
      platforms: {
        ios: null,
      },
    },
  },
};
