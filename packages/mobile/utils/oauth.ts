import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

/** Must match Clerk expo-auth-session default path (see @clerk/expo useOAuth). */
export const OAUTH_REDIRECT_PATH = "oauth-native-callback";

export function getOAuthRedirectUrl(): string {
  return Linking.createURL(OAUTH_REDIRECT_PATH);
}

/** Call only when starting OAuth — not at app launch (iOS 26 TurboModule crash). */
export function prepareOAuthBrowserSession(): void {
  WebBrowser.maybeCompleteAuthSession();
}

/** OAuth return URLs must be handled by expo-web-browser, not share/deep-link routing. */
export function isOAuthCallbackUrl(url: string): boolean {
  if (!url) return false;
  if (url.includes(OAUTH_REDIRECT_PATH)) return true;
  const { path } = Linking.parse(url);
  return path === OAUTH_REDIRECT_PATH || path === "sso-callback";
}
