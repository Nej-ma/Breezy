"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Only initialize once
i18n
.use(HttpBackend)
.use(LanguageDetector)
.use(initReactI18next)
.init({
    fallbackLng: 'fr',
    supportedLngs: ['en', 'fr'],
    debug: false,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
    escapeValue: false
    },
    backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
});


export default i18n;