const FINGERPRINT_STORAGE_KEY = "arcforge_fingerprint";

let inflightFingerprintPromise: Promise<string | null> | null = null;

function readStoredFingerprint(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(
      FINGERPRINT_STORAGE_KEY,
    );

    if (!stored) {
      return null;
    }

    const normalized = stored.trim();

    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

function persistFingerprint(fingerprint: string): void {
  try {
    window.localStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
  } catch {
    // LocalStorage can fail in restricted/private contexts.
    // We still return the in-memory fingerprint for this session.
  }
}

async function generateFingerprint(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const FingerprintJS = (
      await import("@fingerprintjs/fingerprintjs")
    ).default;

    const fpAgent = await FingerprintJS.load();
    const result = await fpAgent.get();
    const visitorId = result.visitorId?.trim();

    if (!visitorId) {
      return null;
    }

    persistFingerprint(visitorId);

    return visitorId;
  } catch {
    return null;
  }
}

export async function getOrCreateFingerprint(): Promise<
  string | null
> {
  const storedFingerprint = readStoredFingerprint();

  if (storedFingerprint) {
    return storedFingerprint;
  }

  if (!inflightFingerprintPromise) {
    inflightFingerprintPromise = generateFingerprint();
  }

  const generatedFingerprint = await inflightFingerprintPromise;
  inflightFingerprintPromise = null;

  return generatedFingerprint;
}
