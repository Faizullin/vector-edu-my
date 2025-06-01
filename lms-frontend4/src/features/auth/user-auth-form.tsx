"use client";

import { PasswordInput } from "@/components/form/password-input";
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
import { URLS } from "@/config/constants";
import { FirebaseAuthError, FirebaseAuthService } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";
import { showToast } from "@/utils/handle-server-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type HTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>;

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Please enter your email address",
    })
    .email({
      message: "Please enter a valid email address",
    }),
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
  // const backendLoginMutation = useMutation({
  //   mutationFn: async (uid: string) => {
  //     return await JwtAuthService.loginWithFirebaseUid(uid);
  //   },
  // });
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await FirebaseAuthService.signInWithEmailAndPassword(
        data.email,
        data.password
      );
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await FirebaseAuthService.signInWithGoogle();
      if (!response) {
        return;
      }
      // await backendLoginMutation.mutateAsync(response.user.uid);
      return response;
    },
    onSuccess(data) {
      if (data) {
        router.push(URLS.HOME);
      }
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    criteriaMode: "all",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    form.clearErrors();
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      if (error instanceof FirebaseAuthError) {
        showToast("error", {
          message: "Something went wrong",
          data: {
            description: error.message,
          },
        });
      }
      // handleServerError(error, {
      //   form: form,
      // });
    }
  };

  const handleGoogleLogin = async () => {
    await googleLoginMutation.mutateAsync();
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-3"
          {...props}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="admin@example.com" {...field} />
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
              </FormItem>
            )}
          />

          {/* Show global form error */}
          {(form.formState.errors as any).errors && (
            <p className="text-sm font-medium text-destructive">
              {(form.formState.errors as any).errors.message}
            </p>
          )}

          <Button
            className="mt-2"
            disabled={loginMutation.isPending}
            size={"sm"}
            type="submit"
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            Login
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={googleLoginMutation.isPending}
        onClick={handleGoogleLogin}
      >
        {googleLoginMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100"
            height="100"
            viewBox="0 0 48 48"
          >
            <path
              fill="#fbc02d"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#e53935"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4caf50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1565c0"
              d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
        )}{" "}
        Google
      </Button>
    </div>
  );
}
