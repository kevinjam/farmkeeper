'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { buildFarmPath, getLocaleFromPathname } from '@/lib/farmPaths';
import { usePathname } from 'next/navigation';

/** Legacy route — redirects to unified settings with Profile tab */
export default function ProfileSettingsRedirect() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const farmSlug = params.farmId as string;
  const locale = getLocaleFromPathname(pathname);

  useEffect(() => {
    router.replace(`${buildFarmPath(farmSlug, '/dashboard/settings', locale)}?tab=profile`);
  }, [farmSlug, locale, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}
