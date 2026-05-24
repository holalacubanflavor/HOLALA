// Sanity client — requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
// Set up at: https://sanity.io → Create project → copy Project ID and Dataset

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = '2024-01-01';

// Check if Sanity is configured
export const isSanityConfigured = Boolean(projectId);

// Dynamic import to avoid build errors when next-sanity is not installed
let _client: unknown = null;

export async function getSanityClient() {
  if (!isSanityConfigured) {
    return null;
  }
  if (!_client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanityModule = await import('next-sanity').catch(() => null) as any;
    if (!sanityModule) return null;
    _client = sanityModule.createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === 'production',
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _client as any;
}
