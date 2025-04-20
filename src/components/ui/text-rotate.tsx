
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
    <span
      className={cn(
        "inline-flex h-[1.5em] overflow-hidden text-blue-600",
        className
      )}
      {...props}
    >
      <span
        className="flex flex-col items-center animate-rotate-words"
        style={{
          transform: `translateY(-${currentWord * 100}%)`,
          transition: "transform 0.5s ease-in-out",
        }}
      >
        {words.map((word, i) => (
          <span key={i} className="h-[1.5em] flex items-center">
            {word}
          </span>
        ))}
      </span>
    </span>
  );
};

export { TextRotate };
