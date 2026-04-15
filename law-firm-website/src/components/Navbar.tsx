'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { clsx } from 'clsx';
import { MenuIcon, XIcon, GlobeIcon } from '@heroicons/react/outline';

const languages = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'tr';

  const getLocalizedPath = (locale: string, path: string = '') => {
    if (locale === 'tr') return `/${path}`;
    return `/${locale}/${path}`;
  };

  const navItems = [
    { key: 'home', label: t('home'), href: '' },
    { key: 'about', label: t('about'), href: 'about' },
    { key: 'services', label: t('services'), href: 'services' },
    { key: 'team', label: t('team'), href: 'team' },
    { key: 'contact', label: t('contact'), href: 'contact' },
  ];

  const currentLang = languages.find(l => l.code === currentLocale) || languages[0];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={getLocalizedPath(currentLocale)} className="flex items-center">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">HukukDan</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={getLocalizedPath(currentLocale, item.href)}
                className={clsx(
                  'text-gray-700 hover:text-blue-900 font-medium transition-colors',
                  pathname === getLocalizedPath(currentLocale, item.href) && 'text-blue-900'
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Language Switcher */}
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light" className="flex items-center gap-2">
                  <GlobeIcon className="w-5 h-5" />
                  <span>{currentLang.flag} {currentLang.label}</span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Language selection">
                {languages.map((lang) => (
                  <DropdownItem key={lang.code}>
                    <Link href={getLocalizedPath(lang.code, pathname.replace(/^\/(en|de|ar)/, '').slice(1))}>
                      {lang.flag} {lang.label}
                    </Link>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="light"
              isIconOnly
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={getLocalizedPath(currentLocale, item.href)}
                className="block py-2 text-gray-700 hover:text-blue-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 mt-4">
              {languages.map((lang) => (
                <Link key={lang.code} href={getLocalizedPath(lang.code)}>
                  <Button size="sm" variant="bordered">
                    {lang.flag} {lang.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}