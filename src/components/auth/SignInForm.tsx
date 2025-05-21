
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { authSchema, AuthFormValues } from "@/schemas/authSchema";
import { EmailPasswordFields } from "./form-fields/EmailPasswordFields";
import { SubmitButton } from "./form-fields/SubmitButton";

interface SignInFormProps {
  isSubmitting: boolean;
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

const SignInForm = ({ isSubmitting, onSubmit }: SignInFormProps) => {
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      universityId: "",
      universityEmail: "",
      telegramUsername: "",
    },
    mode: "onChange"
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <EmailPasswordFields form={form} />
        <SubmitButton 
          isSubmitting={isSubmitting} 
          text="Sign In" 
          loadingText="Signing in..." 
        />
      </form>
    </Form>
  );
};

export default SignInForm;
