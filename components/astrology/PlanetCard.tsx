// components/astrology/PlanetCard.tsx
import { Badge } from "@/components/ui/badge";
import { type AstroPoint } from "@/schemas/astro.schema";

interface PlanetCardProps {
  planet?: AstroPoint;
  name: string;
}

export function PlanetCard({ planet, name }: PlanetCardProps) {
  if (!planet) return null;
  
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{planet.emoji}</span>
        <div>
          <div className="font-medium">{name}</div>
          <div className="flex gap-2 flex-wrap mt-1">
            <Badge variant="outline" className="text-xs">
              {planet.sign} {planet.house?.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {planet.position.toFixed(2)}°
            </Badge>
            {planet.retrograde && (
              <Badge variant="destructive" className="text-xs">
                Rx
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
