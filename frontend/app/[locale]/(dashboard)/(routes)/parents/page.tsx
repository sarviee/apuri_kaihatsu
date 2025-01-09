"use client";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { EllipsisVertical, File } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationApi from "@/components/PaginationApi";
import { Input } from "@/components/ui/input";
import { Link, usePathname, useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import ParentApi from "@/types/parentApi";
import Parent from "@/types/parent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import TableApi from "@/components/TableApi";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import useApiQuery from "@/lib/useApiQuery";
import useApiMutation from "@/lib/useApiMutation";
import useFileMutation from "@/lib/useFileMutation";

export default function Info() {
  const t = useTranslations("parents");
  const tName = useTranslations("names");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data } = useApiQuery<ParentApi>(
    `parent/list?page=${page}&name=${search}`,
    ["parents", page, search]
  );
  const pathName = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [parentId, setParentId] = useState<number | null>(null);
  const { mutate } = useApiMutation<{ message: string }>(
    `parent/${parentId}`,
    "DELETE",
    ["deleteParent"],
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["parents"] });
        toast({
          title: t("parentDeleted"),
          description: data?.message,
        });
      },
    }
  );

  const { mutate: exportParents } = useFileMutation<{ message: string }>(
    `parent/export`,
    ["exportParents"]
  );

  const parentColumns: ColumnDef<Parent>[] = [
    {
      accessorKey: "name",
      header: t("parentName"),
      cell: ({ row }) => (
        <Link href={`/parents/${row.original.id}`}>
          {tName("name", { ...row?.original })}
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: t("Email"),
      cell: ({ row }) => (
        <Link href={`/parents/${row.original.id}`}>
          {row.getValue("email")}
        </Link>
      ),
    },
    {
      accessorKey: "phone_number",
      header: t("Phone_number"),
      cell: ({ row }) => (
        <Link href={`/parents/${row.original.id}`}>
          {row.getValue("phone_number")}
        </Link>
      ),
    },
    {
      header: t("action"),
      cell: ({ row }) => (
        <Dialog key={row.original.id}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  router.push(`${pathName}/${row.original.id}`);
                }}
              >
                {t("view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`${pathName}/edit/${row.original.id}`)
                }
              >
                {t("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DialogTrigger className="w-full">{t("delete")}</DialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tName("name", { ...row?.original })}</DialogTitle>
              <DialogDescription>{row.original.email}</DialogDescription>
            </DialogHeader>
            <div className="flex">{t("doYouDeleteParent")}</div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"secondary"}>{t("close")}</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  setParentId(row.original.id);
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
          <h1 className="text-4xl w-2/4 text-[#5a8dde] font-bold">{t("parents")}</h1>
          <Link href={`${pathName}/create`}>
            <Button>{t("createparent")}</Button>
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
            <PaginationApi data={data?.pagination ?? null} setPage={setPage} />
          </div>
        </div>
        <div className="flex justify-end items-center">
          <Button
            onClick={() => exportParents()}
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-sm"
          >
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
        </div>
        <Card x-chunk="dashboard-05-chunk-3">
          <TableApi data={data?.parents ?? null} columns={parentColumns} />
        </Card>
      </div>
    </div>
  );
}
