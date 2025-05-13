import { ApiError } from "@/client";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/use-auth";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { type HTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>;

const formSchema = z.object({
  username: z.string().min(1, { message: "Please enter your username" }),
  password: z
    .string()
    .min(1, {
      message: "Please enter your password",
    })
    .min(7, {
      message: "Password must be at least 7 characters long",
    }),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { loginMutation, resetError } = useAuth();
  const { showErrorToast } = useCustomToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur",
    criteriaMode: "all",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (form.formState.isSubmitting) return;
    resetError();
    try {
      await loginMutation.mutateAsync(data);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.message === "Bad Request") {
          const errorMsg = (e.body as any)?.errors;
          if (errorMsg) {
            showErrorToast({
              title: "Login failed",
              description: errorMsg,
            });
          } else {
            showErrorToast({
              title: "Login failed",
              description: "Invalid username or password",
            });
          }
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-3", className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              {/* <Link
                to="/forgot-password"
                className="text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75"
              >
                Forgot password?
              </Link> */}
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={loginMutation.isPending}>
          Login
        </Button>
      </form>
    </Form>
  );
}
