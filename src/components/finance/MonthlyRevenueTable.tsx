"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MONTHLY_REVENUE, CURRENT_MONTH, type MonthlyRevenue } from "@/data/finance-seed";
import { Pencil } from "lucide-react";

const STORAGE_KEY = "3w-finance-revenue";

type EditableField = "outsource" | "platform" | "government" | "medical";

const FIELD_LABELS: Record<EditableField, string> = {
  outsource: "외주",
  platform: "플랫폼",
  government: "정부사업",
  medical: "의료",
};

function getStoredRevenue(): MonthlyRevenue[] {
  if (typeof window === "undefined") return MONTHLY_REVENUE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return MONTHLY_REVENUE;
}

function saveRevenue(data: MonthlyRevenue[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  setTimeout(() => window.dispatchEvent(new CustomEvent("finance-revenue-updated")), 0);
}

export function MonthlyRevenueTable() {
  const [data, setData] = useState<MonthlyRevenue[]>(MONTHLY_REVENUE);
  const [editingCell, setEditingCell] = useState<{ row: number; field: EditableField } | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setData(getStoredRevenue());
  }, []);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = useCallback((rowIndex: number, field: EditableField) => {
    setEditingCell({ row: rowIndex, field });
    setEditValue(String(data[rowIndex][field]));
  }, [data]);

  const handleSave = useCallback(() => {
    if (!editingCell) return;
    const newData = [...data];
    const numValue = parseInt(editValue, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      newData[editingCell.row] = {
        ...newData[editingCell.row],
        [editingCell.field]: numValue,
      };
      setData(newData);
      saveRevenue(newData);
    }
    setEditingCell(null);
  }, [editingCell, editValue, data]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") setEditingCell(null);
    },
    [handleSave]
  );

  const getRowTotal = (row: MonthlyRevenue) =>
    row.outsource + row.platform + row.government + row.medical;

  const totals = {
    outsource: data.reduce((acc, m) => acc + m.outsource, 0),
    platform: data.reduce((acc, m) => acc + m.platform, 0),
    government: data.reduce((acc, m) => acc + m.government, 0),
    medical: data.reduce((acc, m) => acc + m.medical, 0),
    total: data.reduce((acc, m) => acc + getRowTotal(m), 0),
  };

  const fields: EditableField[] = ["outsource", "platform", "government", "medical"];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">월별 매출 상세</h3>
          <Badge variant="outline" className="ml-auto text-xs">
            셀 클릭하여 편집
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">월</TableHead>
              <TableHead className="text-right">외주</TableHead>
              <TableHead className="text-right">플랫폼</TableHead>
              <TableHead className="text-right">정부사업</TableHead>
              <TableHead className="text-right">의료</TableHead>
              <TableHead className="text-right">합계</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => {
              const isPast = row.month <= CURRENT_MONTH;
              return (
                <TableRow key={row.month} className={!isPast ? "opacity-60" : ""}>
                  <TableCell className="font-medium">
                    {row.label}
                    {row.month === CURRENT_MONTH && (
                      <Badge variant="default" className="ml-1 text-[10px] px-1 py-0">
                        현재
                      </Badge>
                    )}
                  </TableCell>
                  {fields.map((field) => (
                    <TableCell
                      key={field}
                      className="text-right cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleCellClick(rowIndex, field)}
                    >
                      {editingCell?.row === rowIndex && editingCell?.field === field ? (
                        <Input
                          ref={inputRef}
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSave}
                          onKeyDown={handleKeyDown}
                          className="h-7 w-20 text-right text-xs ml-auto"
                          min={0}
                        />
                      ) : (
                        <span className="text-xs">
                          {row[field].toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold text-xs">
                    {getRowTotal(row).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">합계</TableCell>
              <TableCell className="text-right font-bold text-xs">
                {totals.outsource.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold text-xs">
                {totals.platform.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold text-xs">
                {totals.government.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold text-xs">
                {totals.medical.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold text-xs">
                {totals.total.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
