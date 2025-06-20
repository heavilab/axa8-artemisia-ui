"use client";

import { useUser } from "@/lib/hooks/use-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Profile = {
  firstName: string;
  lastName: string;
  role: string;
  agency: string;
  country: string;
  brand: string;
  entity: string;
};

export default function AccountPage() {
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (user?.email) {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setProfile(snapshot.docs[0].data() as Profile);
        }
      }
    }
    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">You are not logged in.</div>;
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user.displayName || "No name";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <div className="flex items-center gap-4 mb-8">
        <Avatar>
          {/* Optionally, you can use user.photoURL if available */}
          <AvatarFallback>
            {profile?.firstName && profile?.lastName
              ? `${profile.firstName[0]}${profile.lastName[0]}`
              : displayName[0] || user.email?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-lg">{displayName}</div>
          <div className="text-muted-foreground text-sm">{user.email}</div>
          {/* Badge for country-entity-agency or Admin */}
          {profile && (
            <div className="mt-2">
              <Badge variant="secondary">
                {[profile.country, profile.entity, profile.agency].every(
                  (f) => !f || f.trim() === ""
                ) && profile.role === "Admin"
                  ? "Admin"
                  : [profile.country, profile.entity, profile.agency]
                      .map((f) => (f || "").trim())
                      .filter((f) => f !== "")
                      .join("-")}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={profile?.firstName || ""}
            disabled
            placeholder="No first name available"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={profile?.lastName || ""}
            disabled
            placeholder="No last name available"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email || ""}
            disabled
            placeholder="No email available"
          />
        </div>

        {profile && (
          <>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profile.role || ""}
                disabled
                placeholder="No role available"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={profile.brand || ""}
                disabled
                placeholder="No brand available"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
