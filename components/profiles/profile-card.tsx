import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ProfileWithBirthPlace } from '@/lib/api/profile';
import Link from 'next/link';

interface ProfileCardProps {
  profile: ProfileWithBirthPlace;
  isMain: boolean;
  onDelete?: (profileId: string) => void;
}

export function ProfileCard({ profile, isMain, onDelete }: ProfileCardProps) {
  const birthDate = profile.birthDate ? new Date(profile.birthDate) : null;
  const birthTime = profile.birthTime;
  const birthPlace = profile.birthPlace;

  // Get astrology data
  // Note: These variables are calculated but not currently displayed in the UI
  // const sunSign = profile.astrologicalData?.chartData?.sun?.sign;
  // const moonSign = profile.astrologicalData?.chartData?.moon?.sign;
  // const ascendantSign = profile.astrologicalData?.chartData?.asc?.sign;

  // Determine background color based on profile category (currently not used)
  // const getBgColor = () => {
  //   if (profile.profileCategory === ProfileCategory.SELF) {
  //     return 'pb-2';
  //   } else if (profile.profileCategory === ProfileCategory.FAMILY) {
  //     return 'bg-primary/1';
  //   }
  //   return 'bg-background';
  // };

  return (
    <Card className="@container/card">
      <CardHeader className="pb-3">
        <div className="text-sm font-medium text-primary uppercase">
          {profile.profileCategory.charAt(0).toUpperCase() + profile.profileCategory.slice(1)}
        </div>
        <CardTitle className="text-xl">
          {profile.displayName || (isMain ? 'My Profile' : 'Unnamed Profile')}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Birth info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {birthDate ? format(birthDate, 'PPP') : 'No birth date'}
              {birthTime && ` at ${birthTime}`}
            </span>
          </div>

          {birthPlace && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {typeof birthPlace === 'string' ? birthPlace : `${birthPlace.city}, ${birthPlace.country}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex gap-1 ml-auto">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View">
            <Link href={`/dashboard/profiles/${profile.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Edit">
            <Link href={`/dashboard/profiles/${profile.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(profile.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}