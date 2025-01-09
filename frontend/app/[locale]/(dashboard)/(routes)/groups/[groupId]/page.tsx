"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Group from "@/types/group";
import Student from "@/types/student";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import PaginationApi from "@/components/PaginationApi";
import pagination from "@/types/pagination";
import { FormatDate } from "@/lib/utils";
import TableApi from "@/components/TableApi";
import DisplayProperty from "@/components/DisplayProperty";
import { useState } from "react";
import NotFound from "@/components/NotFound";
import useApiQuery from "@/lib/useApiQuery";

export default function ThisGroup({
  params: { groupId },
}: {
  params: { groupId: string };
}) {
  const t = useTranslations("ThisGroup");
  const tName = useTranslations("names");
  const [studentPage, setStudentPage] = useState(1);
  const { data: groupData, isError } = useApiQuery<{
    group: Group;
    pagination: pagination;
    members: Student[];
  }>(`group/${groupId}?page=${studentPage}`, ["group", groupId, studentPage]);

  const studentColumns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <div>{tName("name", { ...row?.original, parents: "" })}</div>
      ),
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
    {
      accessorKey: "student_number",
      header: t("Ststudent_number"),
      cell: ({ row }) => <div>{row.getValue("student_number")}</div>,
    },
  ];

  const groupDate = FormatDate(groupData?.group.created_at ?? "");

  if (isError) return <NotFound />;

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between">
        <h1 className="text-4xl w-2/4 text-[#5a8dde] font-bold">{t("GroupView")}</h1>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/groups`}>
            <Button variant={"secondary"}>{t("back")}</Button>
          </Link>
          <Link href={`/groups/edit/${groupId}`}>
            <Button>{t("editGroup")}</Button>
          </Link>
        </div>
      </div>
      <Card className="space-y-4">
        <CardHeader>
          <DisplayProperty
            property={t("groupName")}
            value={groupData?.group.name}
          />
          <DisplayProperty
            property={t("groupCreationDate")}
            value={groupDate}
          />
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          <div className="flex">
            <h2 className="text-2xl w-2/4 font-bold">{t("students")}</h2>
            <PaginationApi
              data={groupData?.pagination ?? null}
              setPage={setStudentPage}
            />
          </div>
          <div className="rounded-md border">
            <TableApi
              data={groupData?.members ?? null}
              columns={studentColumns}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
