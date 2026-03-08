import { VOICE_LANGUAGES } from '../../hooks/useVoiceInput';

function LanguageSelector({ selectedLang, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {VOICE_LANGUAGES.map((lang) => {
        const isActive = lang.code === selectedLang;
        return (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            title={lang.labelEn}
            className={`
              px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }
            `}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSelector;
