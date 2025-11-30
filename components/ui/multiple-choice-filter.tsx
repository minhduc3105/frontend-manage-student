import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";

interface MultipleChoiceFilterProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function MultipleChoiceFilter({ label, options, selectedValues, onChange }: MultipleChoiceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedCount = selectedValues.length;
  const displayLabel = selectedCount === 0 
    ? `All ${label}` 
    : selectedCount === 1 
      ? selectedValues[0] 
      : `${selectedCount} ${label} selected`;

  return (
    <div className="relative w-48 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full border px-3 py-2 rounded-lg bg-background dark:bg-gray-800 text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        aria-label={`Filter by ${label}`}
      >
        <span>{displayLabel}</span>
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full max-h-60 overflow-y-auto rounded-lg shadow-xl bg-background dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {/* Option "All" / Clear */}
          <button
            onClick={() => {
              if (selectedCount === 0) {
                // Select all if currently all is selected (or none)
                onChange(options);
              } else {
                // Clear all
                onChange([]);
              }
              // Optionally close modal after clearing
            }}
            className="flex items-center justify-between w-full p-2 text-sm text-left text-foreground dark:text-muted-foreground bg-gray-100 dark:bg-gray-700 border-b hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
          >
            {selectedCount === 0 ? `Select All ${label}` : `Clear Selection`}
          </button>

          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <div
                key={option}
                onClick={() => toggleValue(option)}
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                <span>{option}</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-primary border-primary text-white" : "bg-background dark:bg-gray-800 border-gray-300 dark:border-gray-600"}`}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}