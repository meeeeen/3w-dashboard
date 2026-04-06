export const PROJECT_STATUS = {
  planning: { label: "기획", color: "bg-purple-100 text-purple-700 border-purple-200" },
  development: { label: "개발", color: "bg-blue-100 text-blue-700 border-blue-200" },
  operation: { label: "운영", color: "bg-green-100 text-green-700 border-green-200" },
  hold: { label: "보류", color: "bg-gray-100 text-gray-500 border-gray-200" },
  completed: { label: "완료", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
} as const;

export const PROJECT_CATEGORY = {
  internal: { label: "자체서비스", color: "#3B82F6" },
  outsource: { label: "외주", color: "#F59E0B" },
  government: { label: "정부협력", color: "#10B981" },
  medical: { label: "의료플랫폼", color: "#EF4444" },
} as const;

export const PRIORITY = {
  P1: { label: "P1", color: "bg-red-100 text-red-700" },
  P2: { label: "P2", color: "bg-yellow-100 text-yellow-700" },
  P3: { label: "P3", color: "bg-blue-100 text-blue-700" },
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;
export type ProjectCategory = keyof typeof PROJECT_CATEGORY;
export type Priority = keyof typeof PRIORITY;
