import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MultiSelectQuestionProps {
  question: any;
  value: string[] | null | undefined;
  onChange: (value: string[]) => void;
}

export const MultiSelectQuestion = ({ question, value, onChange }: MultiSelectQuestionProps) => {
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggle = (option: string) => {
    const newValue = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValue);
  };

  if (!question.options || !Array.isArray(question.options)) {
    return <div className="text-muted-foreground">Nema dostupnih opcija</div>;
  }

  return (
    <div className="space-y-3">
      {question.options.map((option: string) => (
        <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
          <Checkbox
            id={`${question.id}-${option}`}
            checked={selectedValues.includes(option)}
            onCheckedChange={() => handleToggle(option)}
          />
          <Label 
            htmlFor={`${question.id}-${option}`} 
            className="cursor-pointer flex-1 font-normal"
          >
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
};
