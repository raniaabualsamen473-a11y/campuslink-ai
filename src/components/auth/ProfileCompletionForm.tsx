
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { profileCompletionSchema, ProfileCompletionValues } from "@/schemas/authSchema";
import { User } from "@supabase/supabase-js";
import { ProfileNameField } from "./form-fields/ProfileNameField";
import { ProfileUniversityIdField } from "./form-fields/ProfileUniversityIdField";
import { ProfileTelegramField } from "./form-fields/ProfileTelegramField";
import { ProfileSubmitButton } from "./form-fields/ProfileSubmitButton";
import { useLanguage } from "@/components/LanguageProvider";

interface ProfileCompletionFormProps {
  user: User | null;
  isSubmitting: boolean;
  onSubmit: (values: ProfileCompletionValues) => Promise<void>;
}

const ProfileCompletionForm = ({ user, isSubmitting, onSubmit }: ProfileCompletionFormProps) => {
  const userData = user?.user_metadata || {};
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const form = useForm<ProfileCompletionValues>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      fullName: userData.full_name || "",
      universityId: userData.university_id || "",
      telegramUsername: userData.telegram_username || "",
    },
    mode: "onChange"
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ProfileNameField form={form} />
        <ProfileUniversityIdField form={form} />
        <ProfileTelegramField form={form} />
        <ProfileSubmitButton 
          isSubmitting={isSubmitting} 
          text={isArabic ? "إكمال الملف الشخصي" : "Complete Profile"} 
          loadingText={isArabic ? "جاري حفظ الملف الشخصي..." : "Saving Profile..."}
        />
      </form>
    </Form>
  );
};

export default ProfileCompletionForm;
