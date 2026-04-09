"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, Mail, Building2, Briefcase } from "lucide-react";
import type { Profile, ProjectWithDetails } from "@/types/database";

interface MemberDetailCardProps {
  member: Profile | null;
  projects: ProjectWithDetails[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOTES_STORAGE_KEY = "3w-dashboard-member-notes";

function getMemberNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(NOTES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveMemberNote(memberId: string, note: string) {
  const notes = getMemberNotes();
  if (note.trim()) {
    notes[memberId] = note;
  } else {
    delete notes[memberId];
  }
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

const ROLE_LABELS: Record<string, string> = {
  pmo: "PMO",
  pm: "PM",
  viewer: "팀원",
};

export function MemberDetailCard({
  member,
  projects,
  open,
  onOpenChange,
}: MemberDetailCardProps) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (member) {
      const notes = getMemberNotes();
      setNote(notes[member.id] ?? "");
      setSaved(false);
    }
  }, [member]);

  const assignedProjects = member
    ? projects
        .filter((p) =>
          p.members?.some((pm) => pm.profile_id === member.id)
        )
        .map((p) => ({
          project: p,
          role:
            p.members?.find((pm) => pm.profile_id === member.id)?.role ?? "-",
        }))
    : [];

  const handleSaveNote = useCallback(() => {
    if (!member) return;
    saveMemberNote(member.id, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [member, note]);

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>{member.name.slice(-2)}</AvatarFallback>
            </Avatar>
            <div>
              <div>{member.name}</div>
              <DialogDescription className="font-normal">
                {ROLE_LABELS[member.role] ?? member.role}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {member.department ?? "미배정"}
              </span>
            </div>
          </div>

          {/* Assigned projects */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                담당 프로젝트 ({assignedProjects.length})
              </span>
            </div>
            {assignedProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                배정된 프로젝트가 없습니다.
              </p>
            ) : (
              <div className="space-y-1.5">
                {assignedProjects.map(({ project, role }) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm">{project.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="member-note"
              className="text-sm font-medium mb-1.5 block"
            >
              메모
            </label>
            <Textarea
              id="member-note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSaved(false);
              }}
              placeholder="이 팀원에 대한 메모를 작성하세요..."
              className="min-h-[80px]"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {saved ? "저장 완료" : "localStorage에 저장됩니다"}
              </span>
              <Button size="sm" onClick={handleSaveNote}>
                <Save className="size-3.5 mr-1" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
