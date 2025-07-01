import React from 'react';
import { useTranslation } from 'react-i18next';
import './styles/ThemesSelector.css';

interface Theme {
    value: string;
    label: string;
}

interface ThemesSelectorProps {
    allThemes: Theme[];
    selectedThemes: string[];
    onThemeToggle: (themeValue: string) => void;
    disabled?: boolean;
}

const ThemesSelector: React.FC<ThemesSelectorProps> = ({ 
    allThemes, 
    selectedThemes, 
    onThemeToggle,
    disabled = false 
}) => {
    const { t } = useTranslation();

    return (
        <div className="themes-selector-card"> {/* Reusing 'play-card' style */}
            <div className="themes-selector-grid-content">
                <div className="themes-grid"> {/* Grid or flex for themes */}
                    {allThemes.map(theme => (
                        <button
                            key={theme.value}
                            className={`theme-button ${selectedThemes.includes(theme.value) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                            onClick={() => !disabled && onThemeToggle(theme.value)}
                            disabled={disabled}
                        >
                            {theme.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemesSelector; 