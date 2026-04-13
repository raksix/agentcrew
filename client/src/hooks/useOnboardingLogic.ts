/**
 * useOnboardingLogic Hook
 *
 * İlk kayıt onboarding akışı için kullanıcının adımları tamamlamasını sağlar.
 *
 * Yeni Onboarding Akışı:
 * 1. company - Şirket oluştur (/onboarding/companies)
 * 2. product - Ürün ekle (/onboarding/new-product)
 * 3. leads - Müşteri bul (/onboarding/leads)
 *
 * NOT: Eski onboarding step'leri kaldırıldı.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { toast } from 'sonner';

export const useOnboardingLogic = () => {
    const router = useRouter();
    const { currentStepId, completeStep, isOnboardingMode } = useOnboardingStore();

    // Otomatik Adım Tamamlama Mantığı
    useEffect(() => {
        if (!isOnboardingMode) return;

        const path = router.pathname;

        // 1. Company Adımı - Şirket sayfasındaysa ve company adımı aktifse
        // Not: Bu adım companies.tsx içinde manual olarak tamamlanıyor

        // 2. Product Adımı - Ürün sayfasındaysa ve product adımı aktifse
        // Not: Bu adım new-product.tsx içinde manual olarak tamamlanıyor

        // 3. Leads Adımı - Müşteri bulma sayfasındaysa
        if (currentStepId === 'leads' && path.includes('/onboarding/leads')) {
            // Not: Bu adım leads.tsx içinde manual olarak tamamlanıyor
        }

    }, [currentStepId, isOnboardingMode, router.pathname, completeStep]);

    return {};
};
