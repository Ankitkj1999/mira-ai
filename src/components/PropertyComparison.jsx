import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Bed, Bath, Maximize, MapPin, DollarSign, Home } from 'lucide-react';

const PropertyComparison = ({ properties, onClose }) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper component for feature rows
  const FeatureRow = ({ icon: Icon, label, children, highlight = false }) => (
    <tr className={`border-b ${highlight ? 'bg-muted/50' : 'hover:bg-muted/30'}`}>
      <td className="p-3 font-medium">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          <span>{label}</span>
        </div>
      </td>
      {properties.map((property) => (
        <td key={property.id} className="p-3">
          {children(property)}
        </td>
      ))}
    </tr>
  );

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Property Comparison ({properties.length})
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold text-muted-foreground">Properties</th>
              {properties.map((property) => (
                <th key={property.id} className="text-left p-3 font-semibold min-w-[220px] align-top">
                  <div className="space-y-3">
                    <div className="relative h-32 overflow-hidden rounded-lg">
                      <img
                        src={property.image_url || 'https://placehold.co/300x200/EEE/31343C?font=montserrat&text=No+Image'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/300x200/EEE/31343C?font=montserrat&text=No+Image';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold line-clamp-2 text-sm">{property.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {property.location}
                      </p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <FeatureRow icon={DollarSign} label="Price" highlight>
              {(property) => <span className="font-bold text-primary">{formatPrice(property.price)}</span>}
            </FeatureRow>

            <FeatureRow icon={Home} label="Property Type">
              {(property) => (
                <Badge variant="secondary" className="text-xs">
                  {property.property_type || 'N/A'}
                </Badge>
              )}
            </FeatureRow>

            <FeatureRow icon={Bed} label="Bedrooms">
              {(property) => (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
              )}
            </FeatureRow>

            <FeatureRow icon={Bath} label="Bathrooms">
              {(property) => (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
              )}
            </FeatureRow>

            <FeatureRow icon={Maximize} label="Size">
              {(property) => (
                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4 text-muted-foreground" />
                  <span>{property.size_sqft} sqft</span>
                </div>
              )}
            </FeatureRow>

            <FeatureRow label="Amenities">
              {(property) => (
                <div className="flex flex-wrap gap-1">
                  {property.amenities?.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.amenities.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </FeatureRow>
          </tbody>
        </table>
      </CardContent>

      <div className="p-4 border-t bg-muted/30 flex justify-end">
        <Button onClick={onClose} variant="default">
          Close Comparison
        </Button>
      </div>
    </Card>
  );
};

export default PropertyComparison;