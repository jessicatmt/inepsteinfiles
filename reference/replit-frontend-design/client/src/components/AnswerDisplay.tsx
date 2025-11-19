import { cn } from "@/lib/utils";

interface AnswerDisplayProps {
  name: string;
  found: boolean;
}

export default function AnswerDisplay({ name, found }: AnswerDisplayProps) {
  return (
    <div className="text-center space-y-12">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase" data-testid="text-name">
        {name}
      </h1>
      
      <div className="space-y-6">
        <p className="text-xl md:text-2xl uppercase tracking-wide" data-testid="text-subtitle">
          {found ? "is in the epstein files" : "is not in the epstein files"}
        </p>
        
        <div 
          className={cn(
            "text-8xl md:text-[12rem] font-black tracking-tighter",
            found ? "text-destructive" : "text-foreground"
          )}
          data-testid="text-answer"
        >
          {found ? "YES" : "NO"}
        </div>
      </div>
    </div>
  );
}
