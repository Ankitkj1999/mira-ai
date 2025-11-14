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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col">
      {/* Property Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={property.image_url || 'https://placehold.co/600x400/EEE/31343C?font=montserrat&text=No+Image'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x400/EEE/31343C?font=montserrat&text=No+Image';
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-white text-foreground border border-border shadow-md font-medium text-xs">
            {property.property_type || 'Property'}
          </Badge>
        </div>
        {isSelected && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-white text-foreground border border-border shadow-md font-medium text-xs">
              Selected
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-semibold line-clamp-2">{property.title}</h3>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          {/* Price */}
          <div className="text-lg font-bold text-primary mb-2">{formatPrice(property.price)}</div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <Bed className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
              <span className="text-xs text-muted-foreground">Beds</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <Bath className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{property.bathrooms}</span>
              <span className="text-xs text-muted-foreground">Baths</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <Maximize className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{property.size_sqft}</span>
              <span className="text-xs text-muted-foreground">sqft</span>
            </div>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0.5">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs py-0.5">
                  +{property.amenities.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCompareToggle(property.id)}
            className="text-xs w-full"
          >
            {isSelected ? 'Unselect' : 'Compare'}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default PropertyCard;