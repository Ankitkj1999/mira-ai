import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';

const PropertyCard = ({ property, onCompareToggle, isSelected }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image_url || 'https://placehold.co/600x400/EEE/31343C?font=montserrat&text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x400/EEE/31343C?font=montserrat&text=No+Image';
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs py-1 px-2">
            {property.property_type || 'Property'}
          </Badge>
        </div>
        {isSelected && (
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="bg-primary text-primary-foreground text-xs py-1 px-2">
              Selected
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold line-clamp-2">{property.title}</h3>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          {/* Price */}
          <div className="text-xl font-bold text-primary mb-3">{formatPrice(property.price)}</div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <Bed className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
              <span className="text-xs text-muted-foreground">Beds</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <Bath className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{property.bathrooms}</span>
              <span className="text-xs text-muted-foreground">Baths</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <Maximize className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{property.size_sqft}</span>
              <span className="text-xs text-muted-foreground">sqft</span>
            </div>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {property.amenities.slice(0, 4).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0.5">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs py-0.5">
                  +{property.amenities.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCompareToggle(property.id)}
              className="text-xs"
            >
              {isSelected ? 'Selected' : 'Compare'}
            </Button>
            <Button variant="default" size="sm" className="text-xs">
              View Details
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default PropertyCard;