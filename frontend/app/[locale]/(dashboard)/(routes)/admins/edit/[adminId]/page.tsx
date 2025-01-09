"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/navigation";
import { useMakeZodI18nMap } from "@/lib/zodIntl";
import { useToast } from "@/components/ui/use-toast";
import NotFound from "@/components/NotFound";
import useApiQuery from "@/lib/useApiQuery";
import Admin from "@/types/admin";
import useApiMutation from "@/lib/useApiMutation";

const formSchema = z.object({
  given_name: z.string().min(1).max(50),
  family_name: z.string().min(1).max(50),
  phone_number: z.string().min(10).max(500),
});

export default function EditAdmin({
  params: { adminId },
}: {
  params: { adminId: string };
}) {
  const zodErrors = useMakeZodI18nMap();
  z.setErrorMap(zodErrors);
  const t = useTranslations("EditAdmin");
  const tName = useTranslations("names");
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      given_name: "",
      family_name: "",
      phone_number: "",
    },
  });
  const {
    data: adminData,
    isLoading,
    isError,
  } = useApiQuery<{
    admin: Admin;
  }>(`admin/${adminId}`, ["admin", adminId]);

  const { isPending, mutate } = useApiMutation<{ admin: Admin }>(
    `admin/${adminId}`,
    "PUT",
    ["editAdmin", adminId],
    {
      onSuccess: (data) => {
        form.reset();
        router.push("/admins");
        toast({
          title: t("AdminUpdated"),
          description: tName("name", { ...data?.admin }),
        });
      },
    }
  );

  useEffect(() => {
    if (adminData) {
      form.setValue("given_name", adminData.admin.given_name);
      form.setValue("family_name", adminData.admin.family_name);
      form.setValue("phone_number", adminData.admin.phone_number);
    }
  }, [adminData, form]);

  if (isError) return <NotFound />;

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl w-2/4 text-[#5a8dde] font-bold">{t("EditAdmin")}</h1>
        <Link href={`/admins`}>
          <Button variant={"secondary"}>{t("back")}</Button>
        </Link>
      </div>
      <Form {...form}>
        <form
          onSubmit={() =>
            form.handleSubmit((values) => {
              mutate(values as any);
            })
          }
          className="space-y-4"
        >
          <div className="flex w-full">
            <div className="w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="given_name"
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel>{t("AdminName")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("AdminName")}
                          type="text"
                        />
                      </FormControl>
                      <FormMessage>
                        {formState.errors.given_name &&
                          "Admin name is required. Admin name should be more than 5 characters"}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="family_name"
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel>{t("AdminFamilyName")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("AdminFamilyName")}
                          type="text"
                        />
                      </FormControl>
                      <FormMessage>
                        {formState.errors.family_name &&
                          "Admin family name is required. Admin family name should be more than 5 characters"}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field, formState }) => (
                  <FormItem>
                    <FormLabel>{t("AdminPhone")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("AdminPhone")}
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage>
                      {formState.errors.phone_number &&
                        "Admin phone number is required. Admin phone number should be more than 10 characters"}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  className="self-start"
                  type="submit"
                  disabled={isPending || isLoading}
                >
                  {t("EditAdmin") + (isPending ? "..." : "")}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
