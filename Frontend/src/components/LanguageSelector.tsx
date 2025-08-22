import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import './styles/LanguageSelector.css';

interface LanguageSelectorProps {
  currentLanguage: string;
  onChange: (lang: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'ar', name: 'العربية', flag: 'AR' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageSelect = (langCode: string) => {
    onChange(langCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="language-selector">
      {/* Desktop version - always visible */}
      <div className="language-flags desktop-only">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`language-flag ${currentLanguage === lang.code ? 'active' : ''}`}
            title={lang.name}
          >
            {lang.flag}
          </button>
        ))}
      </div>

      {/* Mobile version - dropdown */}
      <div className="language-dropdown mobile-only">
        <button
          className="language-dropdown-toggle"
          onClick={toggleDropdown}
          aria-label="Select language"
        >
          <FaGlobe className="world-icon" />
          <span className="current-lang">{currentLang?.flag}</span>
          <FaChevronDown className={`chevron-icon ${isOpen ? 'rotated' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="language-dropdown-menu">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`language-dropdown-item ${currentLanguage === lang.code ? 'active' : ''}`}
              >
                <span className="language-flag-text">{lang.flag}</span>
                <span className="language-name">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector; 