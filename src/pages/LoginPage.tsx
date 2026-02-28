import { Link } from "react-router-dom";
import { SignIn } from "@/components/SignIn";
import { TestUserLoginSection } from "@/components/TestUserLoginSection";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 relative star-field">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-pearl-gold/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="relative size-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pearl-gold/20 to-transparent" />
            <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-pearl-gold-light to-pearl-gold" />
          </div>
          <h1 className="text-2xl font-heading text-pearl-warm">
            Welcome Back
          </h1>
          <p className="text-pearl-muted text-sm font-body">
            The stars remember you
          </p>
        </div>

        <TestUserLoginSection />
        <SignIn />

        <p className="text-center text-sm text-pearl-muted font-body">
          New here?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-pearl-gold hover:text-pearl-gold-light"
            asChild
          >
            <Link to="/signup">Begin your journey</Link>
          </Button>
        </p>
      </div>
    </div>
  );
}
