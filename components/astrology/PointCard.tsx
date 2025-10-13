// components/astrology/PointCard.tsx
import { type AstroPoint } from "@/schemas/astro.schema";

interface PointCardProps {
  point?: AstroPoint;
  name: string;
}

export function PointCard({ point, name }: PointCardProps) {
  if (!point) return null;
  
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="font-medium">{name}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-2xl">{point.emoji}</span>
        <div>
          <span className="text-sm">{point.sign} {point.position.toFixed(2)}°</span>
          {point.house && (
            <div className="text-xs text-muted-foreground">
              {point.house.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
