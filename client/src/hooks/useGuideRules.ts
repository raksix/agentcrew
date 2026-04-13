/**
 * useGuideRules - Guide Rule Engine Hook
 *
 * Guide rule'larını yönetir ve mevcut context'e en uygun rehberi seçer.
 *
 * Rule öncelik sırası:
 * 1. Priority (yüksek = daha önemli)
 * 2. Context match (condition true)
 * 3. Daha önce gösterilmemiş (dismissed yok)
 */

import { useMemo } from 'react';
import { useGuideContext, GuideContext } from './useGuideContext';
import { useGuideStore, GuideCategory } from '@/lib/store/guide-store';

export interface GuideAction {
   label: string;
   href?: string;
   onClick?: () => void;
}

export interface GuideMessage {
   title: string;
   content: string;
   action?: GuideAction;
   highlightElement?: string; // Element ID to spotlight
   position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface GuideRule {
   id: string;
   priority: number; // 1-100, daha yüksek = daha öncelikli
   category: GuideCategory;
   condition: (context: GuideContext) => boolean;
   message: GuideMessage;
   // Opsiyonel: Guidance level restriction
   guidanceLevel?: 'minimal' | 'standard' | 'detailed';
}

/**
 * Guide rule'larını context'e göre filtreler ve sıralar
 */
export function useGuideRules(customRules: GuideRule[] = []) {
   const context = useGuideContext();
   const { dismissedGuides, guidanceLevel, isEnabled } = useGuideStore();

   // Eğer guide disable edildiyse, hiçbir rule gösterme
   if (!isEnabled) {
      return { activeRule: null, allRules: [] };
   }

   // Context'e uygun rule'ları bul
   const matchingRules = useMemo(() => {
      return customRules.filter((rule) => {
         // Condition kontrol
         if (!rule.condition(context)) {
            return false;
         }

         // Dismiss kontrol
         if (dismissedGuides.includes(rule.id)) {
            return false;
         }

         // Guidance level kontrol
         if (rule.guidanceLevel && rule.guidanceLevel !== guidanceLevel) {
            return false;
         }

         return true;
      });
   }, [context, dismissedGuides, guidanceLevel, customRules]);

   // Priority'ye göre sırala (yüksek öncelik önce)
   const sortedRules = useMemo(() => {
      return [...matchingRules].sort((a, b) => b.priority - a.priority);
   }, [matchingRules]);

   // En öncelikli rule'u seç
   const activeRule = sortedRules.length > 0 ? sortedRules[0] : null;

   return {
      activeRule,
      allRules: sortedRules,
      hasActiveRule: activeRule !== null,
      context,
   };
}

/**
 * Helper: Birden fazla rule setini birleştirir
 */
export function combineRules(...ruleSets: GuideRule[][]): GuideRule[] {
   return ruleSets.flat();
}

/**
 * Helper: Rule ID'sine göre rule bulur
 */
export function findRuleById(rules: GuideRule[], id: string): GuideRule | undefined {
   return rules.find((rule) => rule.id === id);
}

/**
 * Helper: Category'ye göre rule'ları filtreler
 */
export function filterRulesByCategory(
   rules: GuideRule[],
   category: GuideCategory
): GuideRule[] {
   return rules.filter((rule) => rule.category === category);
}
