import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type StudentItem = { value: string; label: string; name: string };

function StudentCombobox({
  items,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  items: StudentItem[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled: boolean;
  placeholder: string;
}) {
  const anchor = useComboboxAnchor();
  const selected = items.filter((i) => value.includes(i.value));

  return (
    <Combobox
      multiple
      items={items}
      value={selected}
      onValueChange={(v) => onChange(v.map((i) => i.value))}
      disabled={disabled}
      itemToStringLabel={(i) => i.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(vals: StudentItem[]) => (
            <>
              {vals.map((v) => (
                <ComboboxChip key={v.value}>{v.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={vals.length ? "" : placeholder} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>ไม่พบนักศึกษา</ComboboxEmpty>
        <ComboboxList>
          {(item: StudentItem) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, unenrollStudent } =
    useEnrollmentStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));
  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));

  // นักศึกษาที่ยังไม่ได้ลงทะเบียนในวิชาที่เลือก
  const availableStudents: StudentItem[] = formCourse
    ? students
        .filter((s) => !s.enrolledCourses.includes(formCourse))
        .map((s) => ({
          value: s.studentId,
          label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
          name: `${s.firstName} ${s.lastName}`,
        }))
    : [];

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
    }
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enrollStudents(formCourse, formStudents);
    handleDialogOpenChange(false);
  };

  const rows = courses.filter((c) => {
    if (mode === "course")
      return filterCourse === "all" || c.courseCode === filterCourse;
    if (filterStudent === "all") return true;
    return students
      .find((s) => s.studentId === filterStudent)
      ?.enrolledCourses.includes(c.courseCode);
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ต้องการลงทะเบียนได้หลายคน
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(v) => {
                  setFormCourse(v);
                  setFormStudents([]); // เปลี่ยนวิชา → ล้างรายชื่อที่เลือกไว้
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>นักศึกษา</Label>
              <StudentCombobox
                items={availableStudents}
                value={formStudents}
                onChange={setFormStudents}
                disabled={!formCourse}
                placeholder={formCourse ? "เลือกนักศึกษา" : "กรุณาเลือกวิชาก่อน"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button disabled={formStudents.length === 0} onClick={handleEnroll}>
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="w-24">จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => {
              const enrolled = students.filter((s) =>
                s.enrolledCourses.includes(c.courseCode),
              );
              return (
                <TableRow key={c.courseCode}>
                  <TableCell>{c.courseCode}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>{enrolled.length}</TableCell>
                  <TableCell>
                    {enrolled.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {enrolled.map((s) => (
                          <Badge
                            key={s.studentId}
                            className="h-6 gap-1.5 border-blue-500/40 bg-blue-500/15 px-2.5 text-sm font-normal text-blue-700 dark:text-blue-300"
                          >
                            {s.firstName} {s.lastName}
                            <button
                              type="button"
                              aria-label={`ยกเลิกการลงทะเบียนของ ${s.firstName} ${s.lastName}`}
                              className="opacity-60 hover:opacity-100"
                              onClick={() =>
                                unenrollStudent(c.courseCode, s.studentId)
                              }
                            >
                              <X />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">ยังไม่มีนักศึกษา</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}