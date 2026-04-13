/**
 * useGuideContext - Guide Context Detection Hook
 *
 * Kullanıcının mevcut durumunu ve bağlamını algılar.
 * Bu context, guide rules'larının hangi mesajı göstereceğine karar vermesini sağlar.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { useProductStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store';

export interface GuideContext {
   // Page & Route
   currentPage: string;
   routePath: string;

   // Onboarding Progress
   onboardingProgress: number; // 0-1 arası
   currentStepId: string | null;
   isOnboardingComplete: boolean;
   isOnboardingMode: boolean;

   // User Data
   hasProducts: boolean;
   productCount: number;
   hasLeads: boolean;
   leadCount: number;
   hasCampaigns: boolean; // TODO: Campaign store'dan al

   // User Info
   userRole: string;
   isAdmin: boolean;

   // Activity Tracking
   idleTime: number; // saniye cinsinden
   timeOnPage: number; // saniye cinsinden

   // Form State (optional - manuel set edilebilir)
   focusedField?: string;
}

export function useGuideContext() {
   const router = useRouter();
   const { steps, currentStepId, isOnboardingMode } = useOnboardingStore();
   const { products, leads } = useProductStore();
   const { user, isAdmin } = useAuthStore();

   const [idleTime, setIdleTime] = useState(0);
   const [timeOnPage, setTimeOnPage] = useState(0);
   const [focusedField, setFocusedField] = useState<string | undefined>();

   // Calculate onboarding progress
   const completedSteps = steps.filter((s) => s.isCompleted).length;
   const onboardingProgress = steps.length > 0 ? completedSteps / steps.length : 0;
   const isOnboardingComplete = steps.every((s) => s.isCompleted);

   // Track idle time (son aktiviteden beri geçen süre)
   useEffect(() => {
      let lastActivity = Date.now();

      const resetIdleTimer = () => {
         lastActivity = Date.now();
      };

      const checkIdle = () => {
         const idle = Math.floor((Date.now() - lastActivity) / 1000);
         setIdleTime(idle);
      };

      // Event listeners for user activity
      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
      events.forEach((event) => {
         window.addEventListener(event, resetIdleTimer);
      });

      const idleInterval = setInterval(checkIdle, 1000);

      return () => {
         events.forEach((event) => {
            window.removeEventListener(event, resetIdleTimer);
         });
         clearInterval(idleInterval);
      };
   }, []);

   // Track time spent on current page
   useEffect(() => {
      setTimeOnPage(0);
      const pageTimer = setInterval(() => {
         setTimeOnPage((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(pageTimer);
   }, [router.pathname]);

   // Context objesi
   const context: GuideContext = {
      currentPage: router.pathname,
      routePath: router.asPath,
      onboardingProgress,
      currentStepId: currentStepId || null,
      isOnboardingComplete,
      isOnboardingMode,
      hasProducts: products.length > 0,
      productCount: products.length,
      hasLeads: leads.length > 0,
      leadCount: leads.length,
      hasCampaigns: false, // TODO: Campaign store'dan al
      userRole: user?.role || 'user',
      isAdmin: isAdmin || false,
      idleTime,
      timeOnPage,
      focusedField,
   };

   // Helper fonksiyonlar - dışarıdan kullanılabilir
   const helpers = {
      setFocusedField: (field: string) => setFocusedField(field),
      clearFocusedField: () => setFocusedField(undefined),
   };

   return { ...context, ...helpers };
}

/**
 * Kullanım Örnekleri:
 *
 * // Basit kullanım
 * const guideContext = useGuideContext();
 *
 * // Form focus tracking ile
 * const { currentPage, hasProducts, idleTime, setFocusedField } = useGuideContext();
 *
 * <input
 *   onFocus={() => setFocusedField('product-description')}
 *   onBlur={() => setFocusedField(undefined)}
 * />
 */
