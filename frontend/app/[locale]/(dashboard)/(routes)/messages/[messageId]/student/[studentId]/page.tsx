"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Parent from "@/types/parent";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { FormatDateTime } from "@/lib/utils";
import TableApi from "@/components/TableApi";
import DisplayProperty from "@/components/DisplayProperty";
import NotFound from "@/components/NotFound";
import useApiQuery from "@/lib/useApiQuery";
import Student from "@/types/student";
import useApiMutation from "@/lib/useApiMutation";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

export default function ThisStudent({
  params: { messageId, studentId },
}: {
  params: { messageId: string; studentId: string };
}) {
  const t = useTranslations("ThisStudent");
  const tName = useTranslations("names");
  const { data: studentData, isError } = useApiQuery<{
    student: Student;
    parents: Parent[];
  }>(`post/${messageId}/student/${studentId}`, [
    "student",
    messageId,
    studentId,
  ]);

  const { mutate } = useApiMutation<{ message: string }>(
    `post/${messageId}/students/${studentId}`,
    "POST",
    ["student", messageId, studentId],
    {
      onSuccess: (data) => {
        toast({
          title: t("notificationReSent"),
          description: data.message,
        });
      },
    }
  );

  const [parentId, setParentId] = useState<number | null>(null);
  const { mutate: mutateParent } = useApiMutation<{ message: string }>(
    `post/${messageId}/parents/${parentId}`,
    "POST",
    ["student", messageId, studentId],
    {
      onSuccess: (data) => {
        toast({
          title: t("notificationReSent"),
          description: data.message,
        });
      },
    }
  );

  if (isError) return <NotFound />;

  const parentColumns: ColumnDef<Parent>[] = [
    {
      accessorKey: "given_name",
      header: t("parentGivenName"),
      cell: ({ row }) => <div>{row.getValue("given_name")}</div>,
    },
    {
      accessorKey: "family_name",
      header: t("Family_name"),
      cell: ({ row }) => <div>{row.getValue("family_name")}</div>,
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
      accessorKey: "viewed_at",
      header: t("Viewed_at"),
      cell: ({ row }) => (
        <div>
          {row.getValue("viewed_at")
            ? FormatDateTime(row.getValue("viewed_at"))
            : t("noView")}
        </div>
      ),
    },
    {
      header: t("Actions"),
      cell: ({ row }) => (
        <Dialog key={`resendParent${row.original.id}`}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DialogTrigger>
                <DropdownMenuItem>{t("resend")}</DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {tName("name", { ...row.original, parents: "" })}
              </DialogTitle>
              <DialogDescription>{row.original.email}</DialogDescription>
            </DialogHeader>
            <div>{t("doYouReSendNotification")}</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"secondary"}>{t("cancel")}</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setParentId(row.original.id);
                    mutateParent();
                  }}
                >
                  {t("resend")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-between">
        <h1 className="text-4xl text-[#5a8dde] w-2/4 font-bold">{t("posts")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href={`/messages/${messageId}`}>
            <Button variant={"secondary"}>{t("back")}</Button>
          </Link>
          <Dialog key={"resendStudent"}>
            <DialogTrigger asChild>
              <Button>{t("resend")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {studentData &&
                    tName("name", { ...studentData?.student, parents: "" })}
                </DialogTitle>
                <DialogDescription>
                  {studentData?.student.email}
                </DialogDescription>
              </DialogHeader>
              <div>{t("doYouReSendNotification")}</div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"secondary"}>{t("cancel")}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={() => mutate()}>{t("resend")}</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="space-y-4">
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
          <h2 className="text-2xl w-2/4 font-bold">{t("parents")}</h2>
          <div className="rounded-md border">
            <TableApi
              data={studentData?.parents ?? null}
              columns={parentColumns}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
