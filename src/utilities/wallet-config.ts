// Apple Wallet passes must be signed with a Pass Type ID certificate from an
// Apple Developer account. The feature exists only when the secrets do; pages
// import this tiny check without pulling in the pass-signing machinery.
export function isWalletConfigured(): boolean {
  const env = import.meta.env as Record<string, string | undefined>;
  return Boolean(
    env.WALLET_SIGNER_CERT_PEM &&
      env.WALLET_SIGNER_KEY_PEM &&
      env.WALLET_WWDR_PEM &&
      env.WALLET_PASS_TYPE_ID &&
      env.WALLET_TEAM_ID,
  );
}
