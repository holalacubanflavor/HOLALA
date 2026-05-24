// Sanity client — requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
// Set up at: https://sanity.io → Create project → copy Project ID and Dataset

import { createClient, type SanityClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = '2024-01-01';

// Check if Sanity is configured
export const isSanityConfigured = Boolean(projectId);

// Lazy singleton — only created when projectId is present
let _client: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured) return null;
  if (!_client) {
    _client = createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === 'production',
    });
  }
  return _client;
}
