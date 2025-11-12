import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Home, Bed, Bath, Maximize, MapPin } from 'lucide-react';

const PropertyCard = ({ property, onCompareToggle, isSelected }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={property.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur">
            {property.property_type || 'Property'}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          {property.location}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="text-2xl font-bold text-primary">{formatPrice(property.price)}</div>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-muted-foreground" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-muted-foreground" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4 text-muted-foreground" />
            <span>{property.size_sqft} sqft</span>
          </div>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => onCompareToggle(property.id)}
        >
          {isSelected ? 'Selected' : 'Compare'}
        </Button>
        <Button variant="default" size="sm" className="flex-1">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
