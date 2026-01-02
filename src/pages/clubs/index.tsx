import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Users2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { api } from "@/lib/api";
// import { joinClub, leaveClub, isUserMember } from "@/lib/clubs";

interface ClubCard {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isMember: boolean;
  tags: string[];
  logo?: string;
}

export default function ClubsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<ClubCard[]>([
    {
      id: "iiser-tirupati",
      name: "IISER Tirupati Research Club",
      description:
        "A research club for IISER Tirupati students and faculty to collaborate on scientific projects, share knowledge, and discuss the latest research developments.",
      memberCount: 0,
      isMember: false,
      tags: ["Research", "Science", "IISER", "Tirupati"],
      logo: "/images/iiser-tirupati-logo.png",
    },
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load member count for all clubs
        // Note: Currently we only have one hardcoded club, but this pattern scales
        const clubsWithCounts = await Promise.all(
          clubs.map(async (club) => {
            const members = await api.clubs.getMembers(club.id);
            return { ...club, memberCount: members ? members.length : 0 };
          }),
        );

        setClubs(clubsWithCounts);

        if (user) {
          const { isMember } = await api.clubs.isMember("iiser-tirupati", user.id);
          setClubs((prevClubs) =>
            prevClubs.map((club) => ({
              ...club,
              isMember,
            })),
          );
        }
      } catch (error) {
        console.error("Error loading club data:", error);
      }
    };

    loadInitialData();
  }, [user]);

  const handleViewClub = (clubId: string) => {
    navigate(`/clubs/${clubId}`);
  };

  const handleJoinClub = async (clubId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const clubIndex = clubs.findIndex((c) => c.id === clubId);
      if (clubIndex === -1) return;

      const club = clubs[clubIndex];
      const wasMember = club.isMember;

      // Optimistic update
      setClubs((prevClubs) => {
        const updatedClubs = [...prevClubs];
        updatedClubs[clubIndex] = {
          ...club,
          isMember: !wasMember,
          memberCount: wasMember
            ? Math.max(0, club.memberCount - 1)
            : club.memberCount + 1,
        };
        return updatedClubs;
      });

      // Make the API call
      if (wasMember) {
        await api.clubs.leave(clubId);
      } else {
        await api.clubs.join(clubId);
      }
    } catch (error) {
      console.error("Error updating membership:", error);
      // Revert on error
      setClubs([...clubs]);
    }
  };

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          {/* Top bar */}
          <section className="border-b pb-3 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="hidden h-2 w-2 rounded-full bg-emerald-500 md:inline-block" />
                <span className="font-medium text-foreground">Clubs</span>
                <span className="hidden text-[11px] sm:inline-block">
                  Join research communities across campuses
                </span>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <span className="hidden text-[11px] sm:inline-block">
                    Signed in as
                  </span>
                  <span className="max-w-[220px] truncate font-medium text-foreground">
                    {user.email}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Content */}
          <div className="py-6">
            {clubs.length === 0 ? (
              <Card className="glass-card border-dashed">
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <Users2 className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      No clubs available yet
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Check back soon for new research communities to join.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clubs.map((club) => (
                  <Card
                    key={club.id}
                    className="glass-card flex cursor-pointer flex-col justify-between border-neutral-200 bg-neutral-50/60 transition-colors hover:border-neutral-900 hover:bg-white"
                    onClick={() => handleViewClub(club.id)}
                  >
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-neutral-50">
                          {club.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold leading-tight">
                            {club.name}
                          </h2>
                          <div className="mt-1 flex items-center text-[11px] text-muted-foreground">
                            <Users className="mr-1 h-3 w-3" />
                            <span>{club.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                      <p className="line-clamp-3 text-xs text-muted-foreground">
                        {club.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {club.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="border-t bg-neutral-50/60 p-3">
                      <Button
                        size="sm"
                        className="h-7 w-full text-xs"
                        variant={club.isMember ? "outline" : "default"}
                        onClick={(e) => handleJoinClub(club.id, e)}
                        disabled={!user}
                      >
                        {club.isMember ? "Leave club" : "Join club"}
                      </Button>
                      {!user && (
                        <p className="mt-1 text-center text-[10px] text-muted-foreground">
                          Sign in to join clubs
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}