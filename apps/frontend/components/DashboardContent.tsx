'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AddPatientModal from '@/components/AddPatientModal';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Prescriptions } from '@/types';

interface DashboardContentProps {
  isAddPatientModalOpen: boolean;
  setIsAddPatientModalOpen: (open: boolean) => void;
  formData: Prescriptions;
  handleAddPatient: (data: Prescriptions) => void;
  handleCloseModal: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  isAddPatientModalOpen,
  setIsAddPatientModalOpen,
  formData,
  handleAddPatient,
  handleCloseModal
}) => {
  // Premium feature hook - now safely inside SubscriptionProvider
  const { showUpgradeModal, currentFeature, checkFeatureAccess, handleUpgrade, closeModal } = usePremiumFeature();

  return (
    <>
      {/* Test Premium Feature Buttons */}
      <div className="mb-6 bg-white rounded-md border shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            className="justify-start" 
            onClick={() => checkFeatureAccess('NEW_PATIENT', () => setIsAddPatientModalOpen(true))}
          >
            <span className="mr-2">➕</span> New Patient
          </Button>
          <Button 
            variant="outline" 
            className="justify-start" 
            onClick={() => checkFeatureAccess('CREATE_PRESCRIPTION', () => alert('Create Prescription flow coming soon'))}
          >
            <span className="mr-2">📝</span> Create Prescription
          </Button>
          <Button 
            variant="outline" 
            className="justify-start" 
            onClick={() => checkFeatureAccess('SEND_REMINDER', () => alert('Send Reminder flow coming soon'))}
          >
            <span className="mr-2">📨</span> Send Reminder
          </Button>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddPatient}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={closeModal}
        featureName={currentFeature}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};