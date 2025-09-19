import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { LogIn , ArrowRight, Loader } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { toast } from "@/hooks/use-toast";
import { loginMutationFn } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const formSchema = z.object({
    email: z.string().trim().email().min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: (response) => {
        console.log(response.data, "data");
        if (response.data?.mfaRequired) {
          navigate(`/verify-mfa?email=${values.email}`);
          return;
        }
        navigate("/home");
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <main className="w-full min-h-[590px] h-auto max-w-full pt-10">
      <div className="w-full h-full p-5 rounded-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Logo /><LogIn className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-1.5 mt-8 text-center">
            Demandes d'Assistance
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Connectez-vous à votre compte</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="subscribeto@channel.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              className="w-full text-[15px] h-[40px] text-white font-semibold"
              type="submit"
            >
              {isPending && <Loader className="animate-spin" />}
              Se connecter
              <ArrowRight />
            </Button>

            <div className="mb-6 mt-6 flex items-center justify-center">
              <hr
                aria-hidden="true"
                className="h-px w-full bg-[#eee] dark:bg-[#d6ebfd30]"
                data-orientation="horizontal"
              />
              <span className="mx-4 text-xs dark:text-[#f1f7feb5] font-normal">
                Assistance
              </span>
              <hr
                aria-hidden="true"
                className="h-px w-full bg-[#eee] dark:bg-[#d6ebfd30]"
                data-orientation="horizontal"
              />
            </div>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Information :</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Pour vous connecter veuillez utiliser votre compte Active directory.Example</p>
              <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                <p><strong>Utilisateur:</strong> herve.ngando@camlight.cm</p>
                <p className="mt-2"><strong>Mot de passe:</strong> Votre mot de passe Outlook</p>
              </div>
            </div>
          </form>
        </Form>

      </div>
    </main>
  );
}
