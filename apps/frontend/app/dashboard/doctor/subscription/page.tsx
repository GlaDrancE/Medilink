"use client"
import { SubscriptionPage } from '@/components/SubscriptionPage';
import { SubscriptionProvider } from '@/context/SubscriptionContext';

export default function Subscription() {
  return (
    <SubscriptionProvider>
      <SubscriptionPage />
    </SubscriptionProvider>
  )
}