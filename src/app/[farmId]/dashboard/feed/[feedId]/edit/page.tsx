'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wheat } from 'lucide-react';
import FeedStockForm from '@/components/feed/FeedStockForm';
import { FEED_NOTICE, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { emptyFeedForm, feedStockToForm, toFeedstockPayload, type FeedFormData, type FeedStock } from '@/lib/feed';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function EditFeedStockPage({
  params,
}: {
  params: { farmId: string; feedId: string };
}) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const { feedId } = params;
  const [formData, setFormData] = useState<FeedFormData>(emptyFeedForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const goBack = () => router.push(farmPath('/dashboard/feed'));

  useEffect(() => {
    if (!farmId || !feedId) return;

    const load = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getFeedstockById(farmId, feedId);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Feed stock not found');
        }
        setFormData(feedStockToForm(response.data as FeedStock));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed stock');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [farmId, feedId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.updateFeedstock(farmId, feedId, toFeedstockPayload(formData));
      if (!response.success) {
        throw new Error(response.error || 'Failed to update feed stock');
      }
      setFlashNotice(FEED_NOTICE.updated);
      router.push(farmPath('/dashboard/feed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feed stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl max-md:max-w-full max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-orange-400/14 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-orange-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:items-start max-md:gap-3 md:block">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-400/20 text-orange-900 dark:bg-orange-500/18 dark:text-orange-200 md:hidden">
              <Wheat className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-lg max-md:leading-tight">
                Edit feed stock
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px] max-md:leading-snug">
                Update quantity, supplier, or purchase details.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading feed stock…</div>
        ) : (
          <FeedStockForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={goBack}
            isSubmitting={isSubmitting}
            error={error}
            submitLabel="Save changes"
          />
        )}
      </div>
    </div>
  );
}
