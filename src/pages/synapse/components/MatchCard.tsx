import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';
import ProfileModal from '@/components/ProfileModal';

interface MatchProps {
    user: any;
    score: number;
    reasons: string[];
    badges: string[];
}

const MatchCard: React.FC<MatchProps> = ({ user, score, reasons, badges }) => {
    const [showProfile, setShowProfile] = useState(false);

    return (
        <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-neutral-200 flex flex-col justify-between h-full">
                <div>
                    <CardHeader className="p-0">
                        <div className="h-12 bg-neutral-100 border-b border-neutral-200 relative flex items-center justify-between px-4">
                            <div className="text-xs text-neutral-500 font-medium">
                                {user.role || 'Member'}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-xl font-bold text-neutral-900 leading-none">{score}%</p>
                                    <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-semibold">Match</p>
                                </div>
                                {score > 80 && (
                                    <Badge className="bg-neutral-900 hover:bg-neutral-800 text-white border-0 shadow-sm flex items-center gap-1 text-[10px] h-6">
                                        <Star className="w-3 h-3 fill-current" /> Top
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-5 pb-5 pt-5 text-left">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-2 border-neutral-200 shadow-sm bg-white shrink-0">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="text-lg bg-neutral-100 font-bold text-neutral-700">
                                    {user.username ? user.username.substring(0, 2).toUpperCase() : '??'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base text-neutral-900 truncate">{user.full_name || user.username}</h3>
                                <p className="text-xs text-neutral-500">{user.education || 'Researcher'}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5 min-h-[50px] content-start">
                            {badges.map((badge, i) => (
                                <Badge key={i} variant="outline" className="border-neutral-200 text-neutral-600 text-[10px] py-0 px-2 h-5">
                                    {badge}
                                </Badge>
                            ))}
                        </div>

                        <div className="mt-4 space-y-4">
                            {/* Match Reasons */}
                            <div className="bg-neutral-50 p-3 rounded-md border border-neutral-100">
                                <p className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-1">Why</p>
                                <ul className="text-xs text-neutral-600 space-y-1">
                                    {reasons.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <ArrowRight className="w-3 h-3 mt-0.5 text-neutral-400 shrink-0" />
                                            <span>{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </div>

                <CardFooter className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex gap-2 mt-auto">
                    <Button
                        className="w-full bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50 hover:text-black shadow-sm"
                        onClick={() => setShowProfile(true)}
                    >
                        Connect
                    </Button>
                </CardFooter>
            </Card>

            <ProfileModal user={user} isOpen={showProfile} onClose={() => setShowProfile(false)} />
        </>
    );
};

export default MatchCard;
