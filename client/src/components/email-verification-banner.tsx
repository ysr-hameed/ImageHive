import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Mail, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EmailVerificationBannerProps {
  userEmail: string;
  onDismiss?: () => void;
}

export default function EmailVerificationBanner({ userEmail, onDismiss }: EmailVerificationBannerProps) {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);

  const resendEmailMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/resend-verification", { email: userEmail }),
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification email.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 mb-6">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            Email verification required
          </p>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
            Please verify your email address ({userEmail}) to access all features.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resendEmailMutation.mutate()}
            disabled={resendEmailMutation.isPending}
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-800/20"
          >
            <Mail className="w-4 h-4 mr-2" />
            {resendEmailMutation.isPending ? "Sending..." : "Resend"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}