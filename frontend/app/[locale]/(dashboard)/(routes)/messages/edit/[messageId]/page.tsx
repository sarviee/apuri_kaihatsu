"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/navigation";
import { useMakeZodI18nMap } from "@/lib/zodIntl";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import NotFound from "@/components/NotFound";
import useApiQuery from "@/lib/useApiQuery";
import Post from "@/types/post";
import useApiMutation from "@/lib/useApiMutation";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  priority: z.enum(["high", "medium", "low"]),
});

export default function SendMessagePage({
  params: { messageId },
}: {
  params: { messageId: string };
}) {
  const zodErrors = useMakeZodI18nMap();
  z.setErrorMap(zodErrors);
  const t = useTranslations("sendmessage");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "low",
    },
  });
  const router = useRouter();
  const { data, isLoading, isError } = useApiQuery<{
    post: Post;
  }>(`post/${messageId}`, ["message", messageId]);
  const { mutate, isPending } = useApiMutation<{ message: string }>(
    `post/${messageId}`,
    "PUT",
    ["editMessage", messageId],
    {
      onSuccess: (data) => {
        toast({
          title: t("messageEdited"),
          description: data?.message,
        });
        form.reset();
        router.push("/messages");
      },
    }
  );

  useEffect(() => {
    if (data) {
      form.setValue("title", data.post.title);
      form.setValue("description", data.post.description);
      form.setValue("priority", data.post.priority as any);
    }
  }, [data, form]);

  if (isError) return <NotFound />;

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutate(values as any))}
          className="space-y-4"
        >
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-4xl text-[#5a8dde] font-bold">{t("editMessage")}</h1>
            <Link href="/messages" passHref>
              <Button variant={"secondary"}>{t("back")}</Button>
            </Link>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field, formState }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("typeTitle")} />
                </FormControl>
                <FormMessage>
                  {formState.errors.title &&
                    "Title is required. Title should be more than 5 characters"}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field, formState }) => (
              <FormItem>
                <FormLabel>{t("yourMessage")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("typeMessage")} {...field} />
                </FormControl>
                <FormMessage>
                  {formState.errors.description &&
                    "Message is required. Message should be more than 10 characters"}
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field, formState }) => (
              <FormItem>
                <FormLabel>{t("choosePriority")}</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("choosePriority")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t("priority")}</SelectLabel>
                        <SelectItem value="high">{t("high")}</SelectItem>
                        <SelectItem value="medium">{t("medium")}</SelectItem>
                        <SelectItem value="low">{t("low")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>
                  {formState.errors.priority &&
                    "You should select one priority"}
                </FormMessage>
              </FormItem>
            )}
          />

          <Button disabled={isPending || isLoading}>
            {isPending ? `${t("editMessage")}...` : t("editMessage")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
