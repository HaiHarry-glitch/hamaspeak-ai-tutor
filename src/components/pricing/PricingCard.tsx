
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  to: string;
}

const PricingCard = ({
  title,
  price,
  period = "",
  features,
  buttonText,
  highlighted = false,
  to,
}: PricingCardProps) => {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        highlighted ? 
          "border-blue-500 shadow-lg scale-105 hover:scale-[1.06]" : 
          "hover:scale-[1.02] hover:shadow-lg"
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
            Phổ biến nhất
          </span>
        </div>
      )}
      
      <div className={cn(
        "px-6 py-8 space-y-6",
        highlighted ? "bg-gradient-to-b from-blue-50 to-transparent" : ""
      )}>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">{price}</span>
            {period && (
              <span className="text-sm text-gray-500 ml-1">{period}</span>
            )}
          </div>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          asChild
          className={cn(
            "w-full",
            highlighted ? 
              "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600" :
              "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
          )}
        >
          <Link to={to}>{buttonText}</Link>
        </Button>
      </div>
    </Card>
  );
};

export default PricingCard;
