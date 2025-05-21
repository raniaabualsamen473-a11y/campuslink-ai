
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { authSchema, AuthFormValues } from "@/schemas/authSchema";
import { EmailPasswordFields } from "./form-fields/EmailPasswordFields";
import { FullNameField } from "./form-fields/FullNameField";
import { UniversityIdField } from "./form-fields/UniversityIdField";
import { UniversityEmailField } from "./form-fields/UniversityEmailField";
import { TelegramUsernameField } from "./form-fields/TelegramUsernameField";
import { SubmitButton } from "./form-fields/SubmitButton";

interface SignUpFormProps {
  isSubmitting: boolean;
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

const SignUpForm = ({ isSubmitting, onSubmit }: SignUpFormProps) => {
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
        <FullNameField form={form} />
        <UniversityIdField form={form} />
        <UniversityEmailField form={form} />
        <TelegramUsernameField form={form} />
        <SubmitButton 
          isSubmitting={isSubmitting} 
          text="Create Account" 
          loadingText="Creating account..." 
        />
      </form>
    </Form>
  );
};

export default SignUpForm;
