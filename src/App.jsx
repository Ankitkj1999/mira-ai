import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import PropertyCard from '@/components/PropertyCard';
import PropertyComparison from '@/components/PropertyComparison';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight, X } from 'lucide-react';
import { propertiesAPI } from './services/api';

function App() {
  const [properties, setProperties] = useState([]);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [comparisonProperties, setComparisonProperties] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const handlePropertiesFound = (foundProperties) => {
    setProperties(foundProperties);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
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
                  <Button onClick={handleCompare} className="gap-2">
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
      <main className="container mx-auto px-4 py-6">
        {showComparison ? (
          <div className="pb-8">
            <PropertyComparison
              properties={comparisonProperties}
              onClose={() => {
                setShowComparison(false);
                setSelectedForComparison([]);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-1">
              <ChatInterface onPropertiesFound={handlePropertiesFound} />
            </div>

            {/* Properties Grid */}
            <div className="lg:col-span-2">
              {properties.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        Found {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedForComparison.length} selected for comparison
                      </p>
                    </div>
                    
                    {selectedForComparison.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="sm:hidden flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                          <span className="text-xs text-muted-foreground">{selectedForComparison.length} selected</span>
                          <button 
                            onClick={clearSelection}
                            className="rounded-full hover:bg-muted-foreground/10 p-0.5"
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                        <Button onClick={handleCompare} className="gap-2">
                          Compare Selected
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onCompareToggle={handleCompareToggle}
                        isSelected={selectedForComparison.includes(property.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-xl bg-card">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="mx-auto bg-muted rounded-full p-4 w-16 h-16 flex items-center justify-center">
                      <Home className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">No Properties Yet</h3>
                      <p className="text-muted-foreground mt-2">
                        Start chatting with Mira to find your dream home!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 bg-card">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Mira AI - Powered by RAG & Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;