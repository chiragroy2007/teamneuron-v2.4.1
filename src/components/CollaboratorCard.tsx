import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Info } from 'lucide-react';
import ProfileModal from './ProfileModal';

interface CollaboratorCardProps {
  profile: any;
  matchScore?: number;
}

const CollaboratorCard: React.FC<CollaboratorCardProps> = ({ profile, matchScore }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <Card className="group h-full flex flex-col justify-between border border-neutral-200 bg-white transition-all hover:border-neutral-900 shadow-sm hover:shadow-md">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
          <Avatar className="h-12 w-12 border border-neutral-100 group-hover:border-neutral-200 transition-colors">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-neutral-100 text-neutral-600 font-semibold">
              {profile.full_name ? profile.full_name.charAt(0) : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-neutral-900 leading-tight">
                  {profile.full_name || profile.username || 'Anonymous User'}
                </CardTitle>
                <p className="text-xs text-neutral-500 font-medium mt-0.5 flex items-center gap-1">
                  {profile.role && <Briefcase className="w-3 h-3" />}
                  {profile.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4 flex-1">
          {profile.bio && (
            <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.slice(0, 3).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-100 text-[10px] px-2 py-0.5 h-5 font-normal">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 3 && (
                  <span className="text-[10px] text-neutral-400 px-1 py-0.5 self-center">
                    +{profile.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 pb-4 border-t border-neutral-50 flex justify-between items-center bg-neutral-50/30">
          <div className="flex gap-2">
            {/* Match score removed as per request */}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-900 hover:text-white px-3 transition-colors"
              onClick={() => setShowProfile(true)}
            >
              Connect
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ProfileModal
        user={profile}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};

export default CollaboratorCard;
