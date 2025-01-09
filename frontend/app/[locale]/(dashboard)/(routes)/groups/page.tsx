"use client";

import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationApi from "@/components/PaginationApi";
import { Input } from "@/components/ui/input";
import Group from "@/types/group";
import GroupApi from "@/types/groupApi";
import { Link, usePathname, useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import TableApi from "@/components/TableApi";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import useApiQuery from "@/lib/useApiQuery";
import useApiMutation from "@/lib/useApiMutation";

export default function Groups() {
  const t = useTranslations("groups");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pathName = usePathname();
  const router = useRouter();
  const { data } = useApiQuery<GroupApi>(
    `group/list?page=${page}&name=${search}`,
    ["groups", page, search]
  );
  const queryClient = useQueryClient();
  const [groupId, setGroupId] = useState<number | null>(null);
  const { mutate } = useApiMutation<{ message: string }>(
    `group/${groupId}`,
    "DELETE",
    ["deleteGroup"],
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        toast({
          title: t("groupDeleted"),
          description: data.message,
        });
      },
    }
  );

  const columns: ColumnDef<Group>[] = [
    {
      accessorKey: "name",
      header: t("groupName"),
      cell: ({ row }) => (
        <Link href={`groups/${row.original.id}`}>{row.getValue("name")}</Link>
      ),
    },
    {
      accessorKey: "member_count",
      header: t("studentCount"),
      cell: ({ row }) => (
        <Link href={`groups/${row.original.id}`}>
          {row.getValue("member_count")}
        </Link>
      ),
    },
    {
      header: t("action"),
      cell: ({ row }) => (
        <Dialog>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => router.push(`/groups/${row.original.id}`)}
              >
                {t("view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/groups/edit/${row.original.id}`)}
              >
                {t("edit")}
              </DropdownMenuItem>
              <DialogTrigger asChild>
                <DropdownMenuItem>{t("delete")}</DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{row?.original.name}</DialogTitle>
              <DialogDescription>{row.original.member_count}</DialogDescription>
            </DialogHeader>
            <div>{t("DouYouDeleteGroup")}</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"secondary"}>{t("cancel")}</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  setGroupId(row.original.id);
                  mutate();
                }}
              >
                {t("confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="w-full flex justify-between">
          <h1 className="text-4xl w-2/4 text-[#5a8dde] font-bold">{t("groups")}</h1>
          <Link href={`${pathName}/create`}>
            <Button>{t("creategroup")}</Button>
          </Link>
        </div>
        <div className="flex justify-between">
          <Input
            placeholder={t("filter")}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <div className="">
            <PaginationApi data={data?.pagination || null} setPage={setPage} />
          </div>
        </div>
        <Card x-chunk="dashboard-05-chunk-3">
          <TableApi data={data?.groups ?? null} columns={columns} />
        </Card>
      </div>
    </div>
  );
}
