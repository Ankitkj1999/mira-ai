import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Bed, Bath, Maximize, MapPin, DollarSign } from 'lucide-react';

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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compare Properties ({properties.length})</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Feature</th>
                {properties.map((property) => (
                  <th key={property.id} className="text-left p-3 font-semibold min-w-[200px]">
                    <div className="space-y-2">
                      <img
                        src={property.image_url || 'https://via.placeholder.com/200x150'}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="text-sm font-normal line-clamp-2">{property.title}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Price
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3 font-bold text-primary">
                    {formatPrice(property.price)}
                  </td>
                ))}
              </tr>

              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Location
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    {property.location}
                  </td>
                ))}
              </tr>

              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">Property Type</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    <Badge variant="secondary">{property.property_type || 'N/A'}</Badge>
                  </td>
                ))}
              </tr>

              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    Bedrooms
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    {property.bedrooms}
                  </td>
                ))}
              </tr>

              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4 text-muted-foreground" />
                    Bathrooms
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    {property.bathrooms}
                  </td>
                ))}
              </tr>

              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-muted-foreground" />
                    Size
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    {property.size_sqft} sqft
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-muted/50">
                <td className="p-3 font-medium">Amenities</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
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
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyComparison;
