"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Student from "@/types/student";
import Parent from "@/types/parent";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import Group from "@/types/group";
import TableApi from "@/components/TableApi";
import DisplayProperty from "@/components/DisplayProperty";
import NotFound from "@/components/NotFound";
import useApiQuery from "@/lib/useApiQuery";

export default function ThisStudent({
  params: { studentId },
}: {
  params: { studentId: string };
}) {
  const t = useTranslations("ThisStudent");
  const tName = useTranslations("names");
  const { data: studentData, isError } = useApiQuery<{
    student: Student;
    parents: Parent[];
    groups: Group[];
  }>(`student/${studentId}`, ["student", studentId]);

  if (isError) return <NotFound />;

  const parentColumns: ColumnDef<Parent>[] = [
    {
      accessorKey: "name",
      header: t("parentName"),
      cell: ({ row }) => <div>{tName("name", { ...row?.original })}</div>,
    },
    {
      accessorKey: "email",
      header: t("Email"),
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone_number",
      header: t("Phone_number"),
      cell: ({ row }) => <div>{row.getValue("phone_number")}</div>,
    },
  ];

  const groupColumns: ColumnDef<Group>[] = [
    {
      accessorKey: "name",
      header: t("groupName"),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between">
        <h1 className="text-4xl text-[#5a8dde] w-2/4 font-bold">{t("posts")}</h1>
        <div className="space-x-2">
          <Link href={`/students/`}>
            <Button variant={"secondary"}>{t("back")}</Button>
          </Link>
          <Link href={`/students/edit/${studentId}`}>
            <Button>{t("EditStudent")}</Button>
          </Link>
        </div>
      </div>
      <Card className="space-y-4 text-muted-foreground">
        <CardHeader>
          <DisplayProperty
            property={t("givenName")}
            value={studentData?.student.given_name}
          />
          <DisplayProperty
            property={t("familyName")}
            value={studentData?.student.family_name}
          />
          <DisplayProperty
            property={t("studentNumber")}
            value={studentData?.student.student_number}
          />
          <DisplayProperty
            property={t("email")}
            value={studentData?.student.email}
          />
          <DisplayProperty
            property={t("phone")}
            value={studentData?.student.phone_number}
          />
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl text-[#5a8dde] w-2/4 font-bold">{t("parents")}</h2>
            <Link href={`/students/${studentId}/parents`}>
              <Button>{t("editParents")}</Button>
            </Link>
          </div>
          <div className="rounded-md border">
            <TableApi
              data={studentData?.parents ?? null}
              columns={parentColumns}
            />
          </div>
          <Separator />
          <h2 className="text-2xl text-[#5a8dde] w-2/4 font-bold">{t("groups")}</h2>
          <div className="rounded-md border">
            <TableApi
              data={studentData?.groups ?? null}
              columns={groupColumns}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
