import { Link } from "react-router-dom";
import { SignUp } from "@/components/SignUp";
import { TestUserLoginSection } from "@/components/TestUserLoginSection";
import { Button } from "@/components/ui/button";

export function SignupPage() {
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
            Discover Your Design
          </h1>
          <p className="text-pearl-muted text-sm font-body">
            Five ancient systems. One unified truth about you.
          </p>
        </div>

        <TestUserLoginSection />
        <SignUp />

        <p className="text-center text-sm text-pearl-muted font-body">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-pearl-gold hover:text-pearl-gold-light"
            asChild
          >
            <Link to="/login">Sign in</Link>
          </Button>
        </p>
      </div>
    </div>
  );
}
