"use client";

import { useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface MemberPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  compact?: boolean;
}

export function MemberPicker({
  selectedIds,
  onChange,
  placeholder = "멤버 추가",
  compact = false,
}: MemberPickerProps) {
  const { data: members = [] } = useMembers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedMembers = members.filter((m) => selectedIds.includes(m.id));
  const filteredMembers = members.filter(
    (m) =>
      m.name.includes(search) ||
      m.department?.includes(search) ||
      m.email.includes(search)
  );

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const remove = (id: string) => {
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {selectedMembers.map((m) => (
        <Badge
          key={m.id}
          variant="outline"
          className={cn(
            "gap-1 font-normal",
            compact ? "text-[10px] px-1.5 py-0" : "text-xs"
          )}
        >
          {m.name}
          <button
            onClick={() => remove(m.id)}
            className="ml-0.5 hover:text-destructive"
          >
            <X size={compact ? 10 : 12} />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            type="button"
            variant="ghost"
            size={compact ? "icon" : "sm"}
            className={cn(
              compact ? "h-5 w-5" : "h-7 text-xs text-muted-foreground"
            )}
          >
            <UserPlus size={compact ? 10 : 14} />
            {!compact && selectedIds.length === 0 && (
              <span className="ml-1">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <Input
            placeholder="이름 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs mb-2"
          />
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredMembers.map((m) => {
              const selected = selectedIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left hover:bg-accent transition-colors",
                    selected && "bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      selected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    )}
                  >
                    {selected && <Check size={10} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {m.department}
                    </p>
                  </div>
                </button>
              );
            })}
            {filteredMembers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                결과 없음
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function MemberAvatars({
  memberIds,
  allMembers,
  max = 3,
}: {
  memberIds: string[];
  allMembers: Profile[];
  max?: number;
}) {
  const members = allMembers.filter((m) => memberIds.includes(m.id));
  if (members.length === 0) return null;

  const shown = members.slice(0, max);
  const rest = members.length - max;

  return (
    <div className="flex items-center gap-0.5">
      {shown.map((m) => (
        <span
          key={m.id}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[9px] font-medium border border-background"
          title={m.name}
        >
          {m.name.slice(0, 1)}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[10px] text-muted-foreground ml-0.5">
          +{rest}
        </span>
      )}
    </div>
  );
}
