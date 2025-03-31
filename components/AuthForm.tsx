"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { useState } from "react";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, { message: "Name is required" }) : z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(3, { message: "Password must be at least 6 characters" }),
  });
}

const AuthForm = ({ type }: { type: FormType }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (loading) return;
    setLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredentials;
        const result = await signUp({ uid: user.uid, name: name!, email, password });

        if (!result?.success) {
          toast.error(result?.message || "Failed to create an account.");
          return;
        };

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else if (type === "sign-in") {
        const { email, password } = values;
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        const { user } = userCredentials;
        const idToken = await user.getIdToken();

        if (!idToken) {
          // Failed to get user token. Please try again.
          toast.error("Sign in failed.");
          return;
        }

        await signIn({ email, idToken });

        toast.success("Sign in successfully.");
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`There was an error: ${error?.code === "auth/invalid-credential" ? "Invalid credentials" : error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">MoeJob</h2>
        </div>

        <h3>Practice job interviews with AI</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField control={form.control} name="name" label="Name" placeholder="Your Name" />
            )}
            <FormField control={form.control} name="email" label="Email" placeholder="Your email address" />
            <FormField control={form.control} name="password" label="Password" placeholder="Your password" type="password" />
            <Button className="btn" type="submit" disabled={loading}>
              {loading && <Loader size={16} />} {isSignIn ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}{" "}
          <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-bold text-user-primary ml-1">
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  )
};

export default AuthForm;
