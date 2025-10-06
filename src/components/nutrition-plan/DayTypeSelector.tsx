import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trainingDayTypes } from "@/utils/nutritionUtils";

interface DayTypeSelectorProps {
  value: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training';
  onChange: (value: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training') => void;
  disabled?: boolean;
}

export function DayTypeSelector({ value, onChange, disabled }: DayTypeSelectorProps) {
  const selectedType = trainingDayTypes.find(t => t.value === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger 
        className="w-[180px] bg-card border-border"
        style={{
          background: selectedType?.gradient || ''
        }}
      >
        <SelectValue placeholder="Vrsta dana" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border z-50">
        {trainingDayTypes.map((type) => (
          <SelectItem 
            key={type.value} 
            value={type.value}
            className="hover:bg-accent cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ background: type.gradient }}
              />
              <span>{type.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
