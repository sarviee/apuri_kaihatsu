"use client";

import { useTranslations } from "next-intl";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter, usePathname, Link } from "@/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import postView from "@/types/postView";
import { Button } from "@/components/ui/button";
import StudentApi from "@/types/studentApi";
import { Bell, Check, CheckCheck, EllipsisVertical } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Student from "@/types/student";
import { Input } from "@/components/ui/input";
import PaginationApi from "@/components/PaginationApi";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import GroupApi from "@/types/groupApi";
import Group from "@/types/group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormatDateTime } from "@/lib/utils";
import TableApi from "@/components/TableApi";
import { useState } from "react";
import NotFound from "@/components/NotFound";
import useApiQuery from "@/lib/useApiQuery";

export default function ThisMessage({
  params: { messageId },
}: {
  params: { messageId: string };
}) {
  const t = useTranslations("ThisMessage");
  const tName = useTranslations("names");
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useApiQuery<postView>(`post/${messageId}`, [
    "message",
    messageId,
  ]);

  const [studentPage, setStudentPage] = useState(1);
  const [studentSearch, setStudentSearch] = useState("");
  const { data: studentData, isError: isStudentError } =
    useApiQuery<StudentApi>(
      `post/${messageId}/students?page=${studentPage}&email=${studentSearch}`,
      ["student", messageId, studentPage, studentSearch]
    );
  const [groupPage, setGroupPage] = useState(1);
  const [groupSearch, setGroupSearch] = useState("");
  const { data: groupData, isError } = useApiQuery<GroupApi>(
    `post/${messageId}/groups?page=${groupPage}&name=${groupSearch}`,
    ["group", messageId, groupPage, groupSearch]
  );

  const studentColumns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <Link href={`${messageId}/student/${row.original.id}`}>
          {tName("name", { ...row?.original, parents: "" })}
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: t("email"),
      cell: ({ row }) => (
        <Link href={`${messageId}/student/${row.original.id}`}>
          {row.getValue("email")}
        </Link>
      ),
    },
    {
      accessorKey: "student_number",
      header: t("studentId"),
      cell: ({ row }) => (
        <Link href={`${messageId}/student/${row.original.id}`}>
          {row.getValue("student_number")}
        </Link>
      ),
    },
    {
      accessorKey: "phone_number",
      header: t("phoneNumber"),
      cell: ({ row }) => (
        <Link href={`${messageId}/student/${row.original.id}`}>
          {row.getValue("phone_number")}
        </Link>
      ),
    },
    {
      accessorKey: "parents",
      header: t("Parents"),
      cell: ({ row }) => {
        const parents = row.original?.parents || [];
        const anyViewed = parents.some((parent) => parent.viewed_at);

        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link href={`${pathname}/student/${row.original.id}`}>
                <Bell
                  className={anyViewed ? "text-green-500" : "text-red-500"}
                />
              </Link>
            </HoverCardTrigger>
            <HoverCardContent>
              {row.original?.parents?.length
                ? row.original?.parents.map((parent) => (
                    <div key={parent.id}>
                      <div className="flex justify-between py-2">
                        <div className="font-bold">
                          {tName("name", { ...parent })}
                        </div>
                        {parent.viewed_at ? <CheckCheck /> : <Check />}
                      </div>
                      {row.original?.parents?.at(-1) !== parent && (
                        <Separator />
                      )}
                    </div>
                  ))
                : t("noParents")}
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
  ];

  const groupColumns: ColumnDef<Group>[] = [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => (
        <Link href={`${messageId}/group/${row.original.id}`}>
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "viewed_count",
      header: t("viewed_count"),
      cell: ({ row }) => (
        <Link href={`${messageId}/group/${row.original.id}`}>
          {row.getValue("viewed_count")}
        </Link>
      ),
    },
    {
      accessorKey: "not_viewed_count",
      header: t("not_viewed_count"),
      cell: ({ row }) => (
        <Link href={`${messageId}/group/${row.original.id}`}>
          {row.getValue("not_viewed_count")}
        </Link>
      ),
    },
    {
      header: t("Actions"),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                router.push(`${pathname}/group/${row.original.id}`)
              }
            >
              {t("view")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const edited_atDate = FormatDateTime(data?.post?.edited_at ?? "");
  const sent_atDate = FormatDateTime(data?.post?.sent_at ?? "");

  if (isError && isStudentError) return <NotFound />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex wrap justify-between">
        <h1 className="text-4xl text-[#5a8dde] font-bold">{t("ViewMessage")}</h1>
        <div className="space-x-4">
          <Link href="/messages" passHref>
            <Button variant={"secondary"}>{t("back")}</Button>
          </Link>
          <Link href={`/messages/edit/${messageId}`} passHref>
            <Button>{t("editMessage")}</Button>
          </Link>
        </div>
      </div>
      <Card className="space-y-8 p-4">
        <div>
          <CardTitle className="text-xl w-2/4 font-bold">
            {data?.post?.title}
          </CardTitle>
          <CardDescription className="flex">
            {data?.post?.description}
          </CardDescription>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("EditedAt")}</TableHead>
              <TableHead>{t("SentAt")}</TableHead>
              <TableHead>{t("ReadCount")}</TableHead>
              <TableHead>{t("UnReadCount")}</TableHead>
              <TableHead>{t("Priority.default")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{edited_atDate}</TableCell>
              <TableCell>{sent_atDate}</TableCell>
              <TableCell>{data?.post?.read_count}</TableCell>
              <TableCell>{data?.post?.unread_count}</TableCell>
              <TableCell>
                {data?.post && t(`Priority.${data?.post?.priority}`)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Tabs defaultValue="groups" className="w-full">
        <TabsList>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between w-full">
            <Input
              placeholder={t("filterEmail")}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                setGroupSearch(e.target.value);
                setGroupPage(1);
              }}
              className="max-w-xs"
            />
            <div className="">
              <PaginationApi
                data={groupData?.pagination ?? null}
                setPage={setGroupPage}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <TableApi data={groupData?.groups ?? null} columns={groupColumns} />
          </div>
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-between w-full">
            <Input
              placeholder={t("filterEmail")}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                setStudentSearch(e.target.value);
                setStudentPage(1);
              }}
              className="max-w-xs"
            />
            <div className="">
              <PaginationApi
                data={studentData?.pagination ?? null}
                setPage={setStudentPage}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <TableApi
              data={studentData?.students ?? null}
              columns={studentColumns}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
