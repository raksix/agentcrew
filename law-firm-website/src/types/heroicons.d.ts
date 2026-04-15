declare module '@heroicons/react/outline' {
  import type { ComponentType } from 'react';
  import type { SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    'aria-hidden'?: boolean | 'true' | 'false';
    'aria-label'?: string;
    'aria-labelledby'?: string;
    role?: string;
  }

  export const PhoneIcon: ComponentType<IconProps>;
  export const MailIcon: ComponentType<IconProps>;
  export const LocationIcon: ComponentType<IconProps>;
  export const MenuIcon: ComponentType<IconProps>;
  export const XIcon: ComponentType<IconProps>;
  export const GlobeIcon: ComponentType<IconProps>;
  export const ScaleIcon: ComponentType<IconProps>;
  export const ShieldCheckIcon: ComponentType<IconProps>;
  export const UsersIcon: ComponentType<IconProps>;
  export const ChartBarIcon: ComponentType<IconProps>;
}