'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * /profile/[username] → redirect to /[username]
 * Backward compatibility shim so old links keep working.
 */
export default function ProfileRedirect() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  useEffect(() => {
    if (username) {
      router.replace(`/${username}`);
    }
  }, [username, router]);

  return null;
}
