import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/services';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database, Wifi, AlertTriangle, X } from 'lucide-react';

export function BackendInitializer() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed' | 'dismissed'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      const connectionPromise = testSupabaseConnection();
      const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
      
      setConnectionStatus(isConnected ? 'connected' : 'failed');
    } catch (error) {
      console.error('Backend connection error:', error);
      setConnectionStatus('failed');
    }
  };

  const dismissNotification = () => {
    setIsVisible(false);
    setConnectionStatus('dismissed');
  };

  useEffect(() => {
    // Only run once to prevent infinite loops
    if (hasInitialized) return;
    
    setHasInitialized(true);
    
    // Only check connection if not dismissed and Supabase is configured
    if (isSupabaseConfigured) {
      checkConnection();
    } else {
      // If Supabase is not configured, show failed state immediately
      setConnectionStatus('failed');
    }
  }, [isSupabaseConfigured, hasInitialized]); // Add dependencies to prevent infinite loops

  // Connection successful - show success briefly then auto-hide
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // Reduced from 3000 to 2000ms
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  // Failsafe: Auto-dismiss after 15 seconds to prevent hanging
  useEffect(() => {
    const failsafeTimer = setTimeout(() => {
      setIsVisible(false);
      setConnectionStatus('dismissed');
    }, 15000);

    return () => clearTimeout(failsafeTimer);
  }, []);

  // Don't render anything if dismissed
  if (!isVisible || connectionStatus === 'dismissed') {
    return null;
  }

  if (connectionStatus === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Connecting to Backend</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissNotification}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Testing Supabase connection...</span>
            </div>
            {retryCount > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Retry attempt {retryCount}/2
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">Backend Connection Failed</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissNotification}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Alert className="border-orange-200 bg-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Unable to connect to Supabase. Using local storage for now.
              </AlertDescription>
            </Alert>

            <div className="space-y-1 text-xs text-orange-700">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span>Database schema not set up</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-3 w-3" />
                <span>Check .env configuration</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setRetryCount(prev => prev + 1);
                  checkConnection();
                }}
                size="sm"
                variant="outline"
                className="text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                disabled={retryCount >= 3}
              >
                Retry ({retryCount}/3)
              </Button>
              <Button
                onClick={dismissNotification}
                size="sm"
                variant="outline"
                className="text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Continue with Local Storage
              </Button>
            </div>

            <div className="text-xs text-orange-600">
              <p><strong>Tip:</strong> Execute the SQL schema in Supabase to enable backend features.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Backend Connected</span>
              <Badge variant="outline" className="text-green-600 border-green-300">
                Supabase
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissNotification}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Real-time data synchronization active
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default BackendInitializer;