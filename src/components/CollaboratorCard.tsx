import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface CollaboratorCardProps {
  profile: any; // Using any to detach from Supabase types
}

const CollaboratorCard: React.FC<CollaboratorCardProps> = ({ profile }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{profile.full_name || profile.username}</CardTitle>
        <p className="text-sm text-gray-500">{profile.role}</p>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{profile.bio}</p>

        <div className="mb-4">
          <h4 className="font-semibold">Interests</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.interests?.map(interest => <Badge key={interest}>{interest}</Badge>)}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold">Skills</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.skills?.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
          </div>
        </div>

        {profile.linkedin_url && (
          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            LinkedIn Profile
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaboratorCard;
