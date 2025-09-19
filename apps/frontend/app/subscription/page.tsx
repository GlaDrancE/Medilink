'use client';

import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { SubscriptionPage } from '@/components/SubscriptionPage';

export default function Subscription() {
  return (
    <SubscriptionProvider>
      <SubscriptionPage />
    </SubscriptionProvider>
  );
}