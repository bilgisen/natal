import { Fingerprint } from "lucide-react";

export const Logo = () => (
  <div className="flex items-center gap-2">
    <Fingerprint className="w-6 h-6 text-foreground" />
    <div className="text-xl font-bold text-foreground">
      natalmark
    </div>
  </div>
);