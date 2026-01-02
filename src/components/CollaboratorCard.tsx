import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Briefcase, GraduationCap, Percent, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';

interface CollaboratorCardProps {
  profile: any;
  matchScore?: number;
}

const CollaboratorCard: React.FC<CollaboratorCardProps> = ({ profile, matchScore }) => {
  return (
    <Card className="group h-full flex flex-col justify-between border border-neutral-200 bg-white transition-all hover:border-neutral-900 shadow-sm hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <Avatar className="h-10 w-10 border border-neutral-200">
          <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.username} />
          <AvatarFallback className="bg-neutral-100 text-neutral-600 font-medium text-xs">
            {(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-sm font-semibold truncate leading-none text-neutral-900">
              {profile.full_name || profile.username}
            </CardTitle>
            {matchScore !== undefined && (
              <div className="flex items-center gap-1 text-[10px] bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded-full font-medium border border-neutral-200">
                <Percent className="w-3 h-3" />
                {Math.round(matchScore)}
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-500 flex items-center gap-1.5">
            <GraduationCap className="w-3 h-3 text-neutral-400" />
            {profile.role || 'Researcher'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0 pb-4">
        {/* Education Snippet */}
        {profile.education && (
          <div className="text-xs text-neutral-500 mb-3 flex items-center gap-1.5 truncate">
            <Briefcase className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="truncate">{profile.education}</span>
          </div>
        )}

        <p className="text-xs text-neutral-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {profile.bio || "No bio provided."}
        </p>

        {/* Tags */}
        <div className="space-y-4 mt-auto">
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 3).map((interest: string) => (
                <Badge key={interest} variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-normal bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-0">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 3 && (
                <span className="text-[10px] text-neutral-400 self-center pl-1">
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            {profile.linkedin_url ? (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors group/link">
                <ExternalLink className="w-3 h-3 group-hover/link:text-neutral-900" />
                LinkedIn
              </a>
            ) : (<span />)}

            <Button size="sm" variant="outline" className="h-7 text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-900 hover:text-white px-3 transition-colors">
              Connect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaboratorCard;
