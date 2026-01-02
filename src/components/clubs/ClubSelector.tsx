import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Club = {
  id: string;
  name: string;
};

type ClubSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ClubSelector({ value, onChange, className }: ClubSelectorProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClubs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userClubs = await api.clubs.listUserClubs();
        setClubs(userClubs || []);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [user]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading clubs...</div>;
  }

  if (clubs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Label htmlFor="club">Post to Club (optional)</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id="club" className="mt-1">
          <SelectValue placeholder="Select a club (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None (Public Post)</SelectItem>
          {clubs.map((club) => (
            <SelectItem key={club.id} value={club.id}>
              {club.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        Select a club to post this to, or leave as public
      </p>
    </div>
  );
}
