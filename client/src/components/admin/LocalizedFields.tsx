import React from 'react';

interface LocalizedField {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
  rows?: number;
  placeholder?: string;
}

interface LocalizedFieldsProps {
  fields: LocalizedField[];
  form: Record<string, any>;
  onChange: (key: string, value: string) => void;
  languages?: { key: string; label: string }[];
}

const DEFAULT_LANGUAGES = [
  { key: '', label: 'English' },
  { key: 'Amharic', label: 'Amharic' },
  { key: 'Arabic', label: 'Arabic' },
  { key: 'Oromic', label: 'Oromic' },
];

export default function LocalizedFields({
  fields,
  form,
  onChange,
  languages = DEFAULT_LANGUAGES,
}: LocalizedFieldsProps) {
  return (
    <>
      {fields.map((field) =>
        languages.map((lang) => {
          const fieldKey = lang.key ? field.key + lang.key : field.key;
          const value = form[fieldKey] ?? '';
          const label = lang.label === 'English' ? field.label : field.label + ' (' + lang.label + ')';
          const placeholder = field.placeholder || label;

          if (field.type === 'textarea') {
            return (
              <div key={fieldKey}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <textarea
                  value={value}
                  onChange={(e) => onChange(fieldKey, e.target.value)}
                  className="input-field"
                  rows={field.rows || 2}
                  placeholder={placeholder}
                />
              </div>
            );
          }

          return (
            <div key={fieldKey}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                value={value}
                onChange={(e) => onChange(fieldKey, e.target.value)}
                className="input-field"
                placeholder={placeholder}
              />
            </div>
          );
        })
      )}
    </>
  );
}
