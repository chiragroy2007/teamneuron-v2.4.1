import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, GraduationCap, Link as LinkIcon, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose }) => {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-white text-neutral-900 border-neutral-200">
                <DialogHeader>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-4 border-neutral-100 shadow-sm">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-2xl font-bold bg-neutral-100 text-neutral-700">
                                {(user.full_name || user.username || '?').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {user.full_name || user.username}
                            </DialogTitle>
                            <div className="flex flex-wrap gap-3 text-sm text-neutral-500">
                                {user.role && (
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{user.role}</span>
                                    </div>
                                )}
                                {/* Location if we had it, fallback generic if not */}
                            </div>
                            {user.bio && (
                                <DialogDescription className="text-neutral-600 mt-2 text-base leading-relaxed">
                                    {user.bio}
                                </DialogDescription>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Skills */}
                    {user.skills && user.skills.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-900 mb-2 uppercase tracking-wider">Skills & Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                                {user.skills.map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                        {user.education && (
                            <div className="flex items-start gap-2">
                                <GraduationCap className="w-5 h-5 text-neutral-400 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Education</p>
                                    <p className="text-sm text-neutral-600">{user.education}</p>
                                </div>
                            </div>
                        )}

                        {user.linkedin_url && (
                            <div className="flex items-start gap-2">
                                <LinkIcon className="w-5 h-5 text-neutral-400 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Professional Profile</p>
                                    <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-neutral-900 hover:underline">
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-2">
                            <Mail className="w-5 h-5 text-neutral-400 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Contact</p>
                                <p className="text-sm text-neutral-600">
                                    {user.email || 'Email hidden'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={onClose} variant="outline" className="border-neutral-200">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileModal;
