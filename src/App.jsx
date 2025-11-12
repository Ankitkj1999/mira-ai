import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import PropertyCard from './components/PropertyCard';
import PropertyComparison from './components/PropertyComparison';
import { Button } from './components/ui/button';
import { Home, ArrowRight } from 'lucide-react';
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
          alert('You can compare up to 3 properties at a time');
          return prev;
        }
        return [...prev, propertyId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedForComparison.length < 2) {
      alert('Please select at least 2 properties to compare');
      return;
    }

    try {
      const response = await propertiesAPI.compare(selectedForComparison);
      setComparisonProperties(response.data);
      setShowComparison(true);
    } catch (error) {
      console.error('Error comparing properties:', error);
      alert('Failed to compare properties');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Mira AI</h1>
                <p className="text-sm text-muted-foreground">Your AI Real Estate Assistant</p>
              </div>
            </div>
            {selectedForComparison.length > 0 && (
              <Button onClick={handleCompare} className="gap-2">
                Compare {selectedForComparison.length} Properties
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showComparison ? (
          <div className="space-y-4">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      Found {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
                    </h2>
                    {selectedForComparison.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {selectedForComparison.length} selected for comparison
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <Home className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No Properties Yet</h3>
                    <p className="text-muted-foreground">
                      Start chatting with Mira to find your dream home!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Mira AI - Powered by RAG & Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
