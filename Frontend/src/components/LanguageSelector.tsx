import React from 'react';
import { useTranslation } from 'react-i18next';
import '../pages/styles/Home.css';

interface LanguageSelectorProps {
  currentLanguage: string;
  onChange: (lang: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onChange }) => {
  return (
    <div className="language-flags">
      <button
        onClick={() => onChange('fr')}
        className={`language-flag ${currentLanguage === 'fr' ? 'active' : ''}`}
        title="Français"
      >
        FR
      </button>
      <button
        onClick={() => onChange('en')}
        className={`language-flag ${currentLanguage === 'en' ? 'active' : ''}`}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => onChange('ar')}
        className={`language-flag ${currentLanguage === 'ar' ? 'active' : ''}`}
        title="العربية"
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSelector; 