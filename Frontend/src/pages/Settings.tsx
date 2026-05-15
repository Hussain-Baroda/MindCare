import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { getProfile, updateProfile, type UserProfile } from "@/lib/profile";

import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
  type TrustedContact,
} from "@/lib/contacts";

import {
  getCrisisSettings,
  updateCrisisSettings,
  type CrisisSettings,
} from "@/lib/crisis";

import { SendManualAlertButton } from "@/components/SendManualAlertButton";
import CrisisAutoTestCard from "@/components/CrisisAutoTestCard";

const Settings = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    age: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [settings, setSettings] = useState<CrisisSettings>({
    enabled: false,
    mode: "manual",
    delaySeconds: 30,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editing, setEditing] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [c, s, p] = await Promise.all([
        listContacts(),
        getCrisisSettings(),
        getProfile(),
      ]);

      setContacts(c);
      setSettings(s);
      setProfile(p);
    } catch (err: any) {
      toast({
        title: "Failed to load settings",
        description:
          err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const saved = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        age: profile.age,
      });
      setProfile(saved);
      toast({ title: "Saved", description: "Profile updated." });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description:
          err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const saved = await updateCrisisSettings(settings);
      setSettings(saved);
      toast({ title: "Saved", description: "Crisis settings updated." });
    } catch (err: any) {
      toast({
        title: "Save failed",
        description:
          err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAddContact() {
    if (!newName.trim() || !newEmail.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter name and email.",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      await createContact(newName, newEmail);
      setNewName("");
      setNewEmail("");
      toast({ title: "Added", description: "Trusted contact added." });
      await loadAll();
    } catch (err: any) {
      toast({
        title: "Add failed",
        description:
          err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  }

  function startEdit(c: TrustedContact) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditEmail(c.email);
  }

  async function handleUpdateContact() {
    if (!editingId) return;

    if (!editName.trim() || !editEmail.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter name and email.",
        variant: "destructive",
      });
      return;
    }

    setEditing(true);
    try {
      await updateContact(editingId, editName, editEmail);
      toast({ title: "Updated", description: "Contact updated." });
      setEditingId(null);
      await loadAll();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description:
          err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setEditing(false);
    }
  }

  async function handleDeleteContact(id: string) {
    try {
      await deleteContact(id);
      toast({ title: "Deleted", description: "Contact removed." });
      await loadAll();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description:
          err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-muted-foreground">
              Profile, trusted contacts, and crisis alert preferences
            </p>
          </div>

          {/* Profile */}
          <div className="rounded-xl border border-border bg-card text-card-foreground p-6 space-y-4">
            <h2 className="text-xl font-semibold">Profile</h2>

            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pname">Name</Label>
                    <Input
                      id="pname"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pemail">Email</Label>
                    <Input id="pemail" value={profile.email} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email is linked to your login (v1 read-only).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pphone">Phone</Label>
                    <Input
                      id="pphone"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="e.g. +91 98xxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="page">Age</Label>
                    <Input
                      id="page"
                      type="number"
                      min={0}
                      max={120}
                      value={profile.age}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          age:
                            e.target.value === ""
                              ? ""
                              : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Profile"}
                </Button>
              </>
            )}
          </div>

          {/* Crisis Settings */}
          <div className="rounded-xl border border-border bg-card text-card-foreground p-6 space-y-4">
            <h2 className="text-xl font-semibold">Crisis Alerts</h2>

            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">Enable crisis alerts</div>
                    <div className="text-sm text-muted-foreground">
                      If high-risk text is detected, the app can help you reach
                      out.
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        enabled: e.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mode</Label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="mode"
                        checked={settings.mode === "manual"}
                        onChange={() =>
                          setSettings((p) => ({ ...p, mode: "manual" }))
                        }
                        disabled={!settings.enabled}
                      />
                      Manual (you choose to send)
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="mode"
                        checked={settings.mode === "auto"}
                        onChange={() =>
                          setSettings((p) => ({ ...p, mode: "auto" }))
                        }
                        disabled={!settings.enabled}
                      />
                      Automatic (countdown + cancel)
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Auto-send delay (seconds)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min={10}
                    max={300}
                    value={settings.delaySeconds}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        delaySeconds: Number(e.target.value || 30),
                      }))
                    }
                    disabled={!settings.enabled || settings.mode !== "auto"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto mode triggers only for high-risk entries. You can cancel.
                  </p>
                </div>

                <Button onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? "Saving..." : "Save Settings"}
                </Button>

                {/* Test UI (shows only when enabled) */}
                {settings.enabled ? (
                  settings.mode === "manual" ? (
                    <div className="pt-2 space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Manual mode: alerts only send when you choose to send them.
                      </div>
                      <SendManualAlertButton userName={profile.name} />
                    </div>
                  ) : (
                    <div className="pt-2">
                      <CrisisAutoTestCard userName={profile.name} />
                    </div>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground pt-2">
                    Enable crisis alerts to test manual/auto alerts.
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Note: MindCare is not a crisis service. If you’re in immediate
                  danger, contact local emergency services.
                </p>
              </>
            )}
          </div>

          {/* Trusted Contacts */}
          <div className="rounded-xl border border-border bg-card text-card-foreground p-6 space-y-4">
            <h2 className="text-xl font-semibold">Trusted Contacts (Max 3)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="newName">Name</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail">Email</Label>
                <Input
                  id="newEmail"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. mom@gmail.com"
                />
              </div>
            </div>

            <Button onClick={handleAddContact} disabled={adding}>
              {adding ? "Adding..." : "Add Contact"}
            </Button>

            <div className="space-y-3 pt-2">
              {contacts.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No contacts added yet.
                </div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    {editingId === c.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <Input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {c.email}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {editingId === c.id ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={editing}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateContact} disabled={editing}>
                            {editing ? "Saving..." : "Save"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => startEdit(c)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteContact(c.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Contact emails are not verified in v1—please double-check before
              relying on alerts.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
