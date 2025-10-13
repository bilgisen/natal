// components/astrology/HouseCard.tsx
import { type AstroPoint } from "@/schemas/astro.schema";

interface HouseCardProps {
  house?: AstroPoint;
  number: number;
}

export function HouseCard({ house, number }: HouseCardProps) {
  if (!house) return null;
  
  return (
    <div className="border rounded-lg p-3 text-center hover:bg-accent/50 transition-colors">
      <div className="font-medium text-sm">House {number}</div>
      <div className="text-2xl my-1">{house.emoji}</div>
      <div className="text-xs text-muted-foreground">
        {house.sign} {house.position.toFixed(2)}°
      </div>
    </div>
  );
}
