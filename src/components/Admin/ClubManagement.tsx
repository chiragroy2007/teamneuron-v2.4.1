import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Club {
    id: string;
    name: string;
    slug: string;
    description: string;
}

interface ClubMember {
    id: string; // membership id
    user_id: string;
    user: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    };
    created_at: string;
}

const ClubManagement: React.FC = () => {
    const { toast } = useToast();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [members, setMembers] = useState<ClubMember[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClubs();
    }, []);

    useEffect(() => {
        if (selectedClub) {
            fetchMembers(selectedClub.id);
        } else {
            setMembers([]);
        }
    }, [selectedClub]);

    const fetchClubs = async () => {
        try {
            const data = await api.clubs.list();
            setClubs(data || []);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load clubs', variant: 'destructive' });
        }
    };

    const fetchMembers = async (clubId: string) => {
        setLoading(true);
        try {
            const data = await api.clubs.getMembers(clubId);
            setMembers(data || []);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to load members', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedClub) return;
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            // Updated API call
            await api.clubs.removeMember(selectedClub.id, userId);
            toast({ title: 'Success', description: 'Member removed from club.' });
            fetchMembers(selectedClub.id);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to remove member', variant: 'destructive' });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Clubs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-200">
                            {clubs.map((club) => (
                                <li
                                    key={club.id}
                                    className={`p-3 cursor-pointer hover:bg-neutral-50 rounded-md transition-colors ${selectedClub?.id === club.id ? 'bg-neutral-100 font-medium' : ''}`}
                                    onClick={() => setSelectedClub(club)}
                                >
                                    {club.name}
                                </li>
                            ))}
                            {clubs.length === 0 && <div className="text-gray-500 text-sm">No clubs found.</div>}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedClub ? `Members of ${selectedClub.name}` : 'Select a Club'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedClub ? (
                            <>
                                {loading ? (
                                    <div className="text-sm text-gray-500">Loading members...</div>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {members.map((member) => (
                                            <li key={member.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={member.user.avatar_url || ''} />
                                                        <AvatarFallback>{member.user.username[0]?.toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-sm">{member.user.full_name || member.user.username}</div>
                                                        <div className="text-xs text-gray-500">@{member.user.username}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveMember(member.user.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </li>
                                        ))}
                                        {members.length === 0 && <div className="text-gray-500 text-sm mt-4">No members in this club.</div>}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <div className="text-gray-500 text-sm">Select a club from the list to view and manage members.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ClubManagement;
