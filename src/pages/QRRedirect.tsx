import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function QRRedirect() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get the data from URL parameters
    const data = searchParams.get('data');
    
    if (data) {
      // Redirect to the QR result page with the data
      window.location.href = `/qr-result?data=${encodeURIComponent(data)}`;
    } else {
      // If no data, redirect to home
      window.location.href = '/';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to product details...</p>
      </div>
    </div>
  );
}
