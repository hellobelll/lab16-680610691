import { useState } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Item = { value: string; label: string };

function InstructorCombobox({
  value,
  onChange,
  allNames,
}: {
  value: string[];
  onChange: (names: string[]) => void;
  allNames: string[];
}) {
  const anchor = useComboboxAnchor();
  const [query, setQuery] = useState("");
  const q = query.trim();

  const pool = Array.from(new Set([...allNames, ...value]));
  const matched = pool.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  const canCreate =
    q !== "" && !pool.some((n) => n.toLowerCase() === q.toLowerCase());

  const items: Item[] = [
    ...matched.map((n) => ({ value: n, label: n })),
    ...(canCreate ? [{ value: q, label: `+ เพิ่มผู้สอน "${q}"` }] : []),
  ];
  const selected: Item[] = value.map((n) => ({ value: n, label: n }));

  return (
    <Combobox
      multiple
      items={items}
      filter={null}
      value={selected}
      onValueChange={(v) => {
        onChange(v.map((i) => i.value));
        setQuery("");
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(i) => i.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(vals: Item[]) => (
            <>
              {vals.map((v) => (
                <ComboboxChip key={v.value}>{v.value}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={vals.length ? "" : "พิมพ์ชื่อผู้สอน"}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
        <ComboboxList>
          {(item: Item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } =
    useEnrollmentStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const allInstructors = Array.from(
    new Set(courses.flatMap((c) => c.instructors ?? [])),
  );

  const trimmedCode = code.trim();
  const isDuplicate =
    trimmedCode !== "" &&
    courses.some(
      (c) => c.courseCode.toLowerCase() === trimmedCode.toLowerCase(),
    );
  const canSave = trimmedCode !== "" && title.trim() !== "" && !isDuplicate;

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setCode("");
      setTitle("");
      setInstructors([]);
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    addCourse({
      courseCode: trimmedCode.toUpperCase(),
      courseTitle: title.trim(),
      instructors,
    });
    handleOpenChange(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  aria-invalid={isDuplicate}
                />
                {isDuplicate && (
                  <p className="text-xs text-destructive">
                    มีรหัสวิชา {trimmedCode.toUpperCase()} นี้แล้ว
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>ผู้สอน</Label>
                <InstructorCombobox
                  value={instructors}
                  onChange={setInstructors}
                  allNames={allInstructors}
                />
              </div>
            </div>

            <DialogFooter>
              <Button disabled={!canSave} onClick={handleSave}>
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ยังไม่มีวิชา
                </TableCell>
              </TableRow>
            )}
            {courses.map((c) => (
              <TableRow key={c.courseCode}>
                <TableCell>{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell>
                  {c.instructors && c.instructors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.instructors.map((name) => (
                        <Badge
                          key={name}
                          className="h-6 gap-1.5 border-blue-500/40 bg-blue-500/15 px-2.5 text-sm font-normal text-blue-700 dark:text-blue-300"
                        >
                          {name}
                          <button
                            type="button"
                            aria-label={`ลบผู้สอน ${name}`}
                            className="opacity-60 hover:opacity-100"
                            onClick={() => removeInstructor(c.courseCode, name)}
                          >
                            <X />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`ลบวิชา ${c.courseCode}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(c.courseCode)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบวิชา {deleteTarget}?</AlertDialogTitle>
            <AlertDialogDescription>
              การลงทะเบียนของนักศึกษาในวิชานี้จะถูกลบไปด้วย และไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) removeCourse(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              ลบวิชา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}