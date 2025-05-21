
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { profileCompletionSchema, ProfileCompletionValues } from "@/schemas/authSchema";
import { User } from "@supabase/supabase-js";
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

  // Auto-generate university email when university ID changes
  const universityId = form.watch("universityId");
  const universityEmail = universityId && universityId.length === 7 
    ? `${universityId.slice(0, 3)}${universityId}@ju.edu.jo` 
    : "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {isArabic ? "الاسم الكامل" : "Full Name"}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={isArabic 
                    ? "الاسم الكامل كما هو مكتوب على بطاقة الجامعة" 
                    : "Full name as it's shown on your university ID"
                  } 
                  {...field} 
                  className="glass-input"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="universityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {isArabic ? "رقم الطالب الجامعي" : "University ID"}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={isArabic ? "رقم مكون من 7 أرقام" : "7-digit ID number"} 
                  {...field} 
                  className="glass-input"
                  required
                  maxLength={7}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {universityId && universityId.length === 7 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {isArabic ? "البريد الإلكتروني الجامعي" : "University Email"}
            </label>
            <Input 
              value={universityEmail}
              className="glass-input"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              {isArabic 
                ? "تم إنشاؤه تلقائيًا من رقم الطالب الجامعي" 
                : "Auto-generated from your university ID"}
            </p>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="telegramUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                {isArabic ? "اسم المستخدم في تيليجرام" : "Telegram Username"}
              </FormLabel>
              <div className="flex items-center">
                <span className="bg-muted border border-r-0 border-input rounded-l-md px-3 py-2 text-sm text-foreground">
                  @
                </span>
                <FormControl>
                  <Input 
                    placeholder={isArabic ? "اسم المستخدم" : "username"} 
                    {...field} 
                    className="glass-input rounded-l-none"
                  />
                </FormControl>
              </div>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {isArabic 
                  ? "مطلوب للتواصل معك عند العثور على مطابقة" 
                  : "Required for contacting you when a match is found"}
              </p>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          variant="neon"
          className="w-full btn-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isArabic ? "جاري حفظ الملف الشخصي..." : "Saving Profile..."}
            </span>
          ) : (
            <>{isArabic ? "إكمال الملف الشخصي" : "Complete Profile"}</>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileCompletionForm;
