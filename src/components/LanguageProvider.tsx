
import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import enTranslation from '../locales/en.json';
import arTranslation from '../locales/ar.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      ar: {
        translation: arTranslation
      }
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    }
  });

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: string;
  storageKey?: string;
};

type LanguageProviderState = {
  language: string;
  setLanguage: (language: string) => void;
  isRTL: boolean;
};

const initialState: LanguageProviderState = {
  language: 'en',
  setLanguage: () => null,
  isRTL: false,
};

const LanguageContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = 'en',
  storageKey = 'campuslink-language',
  ...props
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<string>(
    () => localStorage.getItem(storageKey) || defaultLanguage
  );
  
  const isRTL = language === 'ar';

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isRTL) {
      root.setAttribute('dir', 'rtl');
      root.classList.add('rtl');
    } else {
      root.setAttribute('dir', 'ltr');
      root.classList.remove('rtl');
    }
  }, [isRTL]);

  const setLanguage = (language: string) => {
    localStorage.setItem(storageKey, language);
    i18n.changeLanguage(language);
    setLanguageState(language);
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider
      {...props}
      value={{
        language,
        setLanguage,
        isRTL
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

export const useTranslate = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  return { t, language };
};
