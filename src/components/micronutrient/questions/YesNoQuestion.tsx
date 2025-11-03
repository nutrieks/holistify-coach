import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface YesNoQuestionProps {
  question: any;
  value: any;
  onChange: (value: any) => void;
}

export const YesNoQuestion = ({ question, value, onChange }: YesNoQuestionProps) => {
  const selectedValue = value?.selected || value;

  return (
    <div className="flex gap-4">
      <Button
        type="button"
        variant={selectedValue === 'Da' ? 'default' : 'outline'}
        className="flex-1 h-20"
        onClick={() => onChange({ selected: 'Da' })}
      >
        <Check className="mr-2 h-5 w-5" />
        Da
      </Button>
      <Button
        type="button"
        variant={selectedValue === 'Ne' ? 'default' : 'outline'}
        className="flex-1 h-20"
        onClick={() => onChange({ selected: 'Ne' })}
      >
        <X className="mr-2 h-5 w-5" />
        Ne
      </Button>
    </div>
  );
};
