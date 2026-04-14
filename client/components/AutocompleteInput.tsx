import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions: string[];
  className?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  placeholder,
  suggestions,
  className,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions(suggestions);
      setOpen(false);
    }
  }, [inputValue, suggestions]);

  const handleSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) {
                setOpen(true);
              }
            }}
            placeholder={placeholder}
            className={className}
            autoComplete="off"
          />
        </div>
      </PopoverTrigger>
      {filteredSuggestions.length > 0 && (
        <PopoverContent
          className="p-0 w-full"
          align="start"
        >
          <Command>
            <CommandList>
              {filteredSuggestions.length === 0 ? (
                <CommandEmpty>Nenhuma sugestão encontrada</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredSuggestions.map((suggestion, index) => (
                    <CommandItem
                      key={`${suggestion}-${index}`}
                      value={suggestion}
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
