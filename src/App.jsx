import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import PropertyCard from '@/components/PropertyCard';
import PropertyComparison from '@/components/PropertyComparison';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, ArrowRight, X } from 'lucide-react';
import { propertiesAPI, healthAPI } from './services/api';

function App() {
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [comparisonProperties, setComparisonProperties] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Mira, your AI real estate assistant. How can I help you find your dream home today?",
    },
  ]);
  const [healthStatus, setHealthStatus] = useState('checking'); // 'healthy', 'unhealthy', 'checking'

  // Check health status on mount and every 30 seconds
  useEffect(() => {
    const checkHealth = async () => {
      const result = await healthAPI.checkHealth();
      setHealthStatus(result.status);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCompareToggle = (propertyId) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      } else {
        if (prev.length >= 3) {
          // We could show a toast here instead of alert
          return prev;
        }
        return [...prev, propertyId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedForComparison.length < 2) {
      // We could show a toast here instead of alert
      return;
    }

    try {
      const response = await propertiesAPI.compare(selectedForComparison);
      setComparisonProperties(response.data);
      setShowComparison(true);
    } catch (error) {
      console.error('Error comparing properties:', error);
      // We could show a toast here instead of alert
    }
  };

  const clearSelection = () => {
    setSelectedForComparison([]);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-card/80 backdrop-blur-sm z-10">
        <div className="w-full max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mira AI</h1>
                <p className="text-xs text-muted-foreground">Your AI Real Estate Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Health Status Indicator */}
              <div 
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-border/50 bg-transparent"
                title={healthStatus === 'healthy' ? 'Server Online' : healthStatus === 'unhealthy' ? 'Server Offline' : 'Checking Status'}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  healthStatus === 'healthy' 
                    ? 'bg-green-500' 
                    : healthStatus === 'unhealthy'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {healthStatus === 'healthy' ? 'Online' : healthStatus === 'unhealthy' ? 'Offline' : 'Checking'}
                </span>
              </div>
              
              {selectedForComparison.length > 0 && (
                <>
                  <div className="hidden sm:flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground">{selectedForComparison.length} selected</span>
                    <button 
                      onClick={clearSelection}
                      className="rounded-full hover:bg-muted-foreground/10 p-0.5"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  <Button onClick={handleCompare} className="gap-2" size="sm">
                    Compare
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {showComparison ? (
          <div className="h-full w-full overflow-y-auto pb-8">
            <div className="w-full max-w-6xl mx-auto px-4">
              <PropertyComparison
                properties={comparisonProperties}
                onClose={() => {
                  setShowComparison(false);
                  setSelectedForComparison([]);
                }}
              />
            </div>
          </div>
        ) : (
          <ChatInterface
            selectedForComparison={selectedForComparison}
            onCompareToggle={handleCompareToggle}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </main>
    </div>
  );
}

export default App;