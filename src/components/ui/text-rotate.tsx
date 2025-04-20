
import React from "react";
import { cn } from "@/lib/utils";

interface TextRotateProps extends React.HTMLAttributes<HTMLDivElement> {
  words: string[];
  className?: string;
}

const TextRotate = ({ words, className, ...props }: TextRotateProps) => {
  const [currentWord, setCurrentWord] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div
      className={cn(
        "relative h-20 overflow-hidden bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      <div
        className="absolute transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateY(-${currentWord * 100}%)`,
        }}
      >
        {words.map((word, i) => (
          <div key={i} className="h-20 flex items-center text-4xl font-bold">
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};

export { TextRotate };
