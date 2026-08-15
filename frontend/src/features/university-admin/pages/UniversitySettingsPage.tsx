"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { universityAdminService } from "../services/university-admin.service";

export const UniversitySettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    universityAdminService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setContactEmail(data.contactEmail || "");
        setContactPhone(data.contactPhone || "");
        setCountry(data.country || "");
        setState(data.state || "");
        setCity(data.city || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await universityAdminService.updateProfile({
        name,
        contactEmail,
        contactPhone,
        country,
        state,
        city,
      });
      setProfile(updated);
      alert("University profile updated successfully");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">University Settings</h1>
        <p className="text-sm text-muted">Manage university profile, contact information, and institutional details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Settings className="h-4 w-4 inline mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">University Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Contact Email</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Contact Phone</label>
                <Input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Country</label>
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">State / Region</label>
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">City</label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} variant="default">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving Changes..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
