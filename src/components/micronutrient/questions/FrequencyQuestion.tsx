import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FrequencyQuestionProps {
  question: any;
  value: any;
  onChange: (value: any) => void;
}

const frequencyOptions = [
  'Nikad ili vrlo rijetko',
  '1-2 puta mjesečno',
  '1-3 puta tjedno',
  '4-6 puta tjedno',
  'Dnevno ili više'
];

export const FrequencyQuestion = ({ question, value, onChange }: FrequencyQuestionProps) => {
  const selectedValue = value?.selected || value;

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={(val) => onChange({ selected: val })}
      className="space-y-3"
    >
      {frequencyOptions.map((option) => (
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
