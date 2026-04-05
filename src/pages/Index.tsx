// ─── Landing / Index — redirects to editor ───

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/editor?mode=classic", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading Glow Studio Pro...</div>
    </div>
  );
};

export default Index;
