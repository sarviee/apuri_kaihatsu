"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentTable } from "@/components/StudentTable";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Student from "@/types/student";
import { useMakeZodI18nMap } from "@/lib/zodIntl";
import { Link, useRouter } from "@/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import useApiMutation from "@/lib/useApiMutation";
import Group from "@/types/group";

const formSchema = z.object({
  name: z.string().min(1),
  semester: z.string().optional(),
});

export default function CreateGroup() {
  const zodErrors = useMakeZodI18nMap();
  z.setErrorMap(zodErrors);
  const t = useTranslations("CreateGroup");
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      semester: "",
    },
  });

  const { isPending, mutate } = useApiMutation<{ group: Group }>(
    `group/create`,
    "POST",
    ["createGroup"],
    {
      onSuccess: (data) => {
        toast({
          title: t("GroupCreated"),
          description: data.group.name,
        });
        form.reset();
        router.push("/groups");
        setSelectedStudents([]);
      },
    }
  );

  useEffect(() => {
    const savedFormData = localStorage.getItem("formDataCreateGroup");
    const parsedFormData = savedFormData && JSON.parse(savedFormData);
    if (parsedFormData) {
      form.setValue("name", parsedFormData.name);
      form.setValue("semester", parsedFormData.semester);
    }

    const subscription = form.watch((values) => {
      localStorage.setItem("formDataCreateGroup", JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between">
        <h1 className="text-4xl w-2/4 text-[#5a8dde] font-bold">{t("CreateGroup")}</h1>
        <Link href={`/groups`} passHref>
          <Button variant={"secondary"}>{t("back")}</Button>
        </Link>
      </div>
      <div className="w-full mt-8">
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => mutate({...data, students: selectedStudents.map(student => student.id)} as any))}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field, formState }) => (
                  <FormItem>
                    <FormLabel>{t("GroupName")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("GroupName")} />
                    </FormControl>
                    <FormMessage>{formState.errors.name?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("GroupSemester")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("GroupSemester")} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>{t("Students")}</FormLabel>
              <FormControl>
                <StudentTable
                  selectedStudents={selectedStudents}
                  setSelectedStudents={setSelectedStudents}
                />
              </FormControl>
            </FormItem>

            <Button disabled={isPending}>
              {isPending ? `${t("CreateGroup")}...` : t("CreateGroup")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
