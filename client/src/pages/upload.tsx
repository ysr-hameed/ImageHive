import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleUploadForm } from "@/components/simple-upload-form";
import { PageLoader } from "@/components/futuristic-loader";
import { useLocation } from "wouter";

export default function Upload() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      setLocation("/auth/login");
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader text="Preparing upload interface..." />;
  }

  // Show loading state if not authenticated while redirecting
  if (!isAuthenticated) {
    return <PageLoader text="Redirecting to login..." />;
  }

  

  return (
    <div className="w-full max-w-none min-h-screen space-y-4 p-4 md:p-6">
        {/* Upload Form */}
        <SimpleUploadForm />
    </div>
  );
}