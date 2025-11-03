import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PortionQuestionProps {
  question: any;
  value: any;
  onChange: (value: any) => void;
}

export const PortionQuestion = ({ question, value, onChange }: PortionQuestionProps) => {
  const selectedValue = value?.selected || value;
  const options = question.options as string[] || [];

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={(val) => onChange({ selected: val })}
      className="space-y-3"
    >
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
          <Label
            htmlFor={`${question.id}-${option}`}
            className="font-normal cursor-pointer flex-1"
          >
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};
