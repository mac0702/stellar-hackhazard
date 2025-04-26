import { Contract } from 'stellar-sdk';

interface AidTokenParams {
  issuer: string;
  recipient: string;
  amount: number;
  restrictions: {
    geographicBounds?: {
      lat: number;
      long: number;
      radius: number;
    };
    expiryDate?: Date;
    usageCategories?: string[];
  };
}

/**
 * AidToken represents a programmable aid unit with built-in compliance parameters
 * and usage restrictions to ensure proper aid distribution.
 */
export class AidToken extends Contract {
  private params: AidTokenParams;

  constructor(params: AidTokenParams) {
    super();
    this.params = params;
  }

  /**
   * Validates if the token can be used in the given context
   */
  public async validateUsage(context: {
    location?: { lat: number; long: number };
    category?: string;
  }): Promise<boolean> {
    // Geographic restriction check
    if (context.location && this.params.restrictions.geographicBounds) {
      const distance = this.calculateDistance(
        context.location,
        this.params.restrictions.geographicBounds
      );
      if (distance > this.params.restrictions.geographicBounds.radius) {
        return false;
      }
    }

    // Category restriction check
    if (context.category && this.params.restrictions.usageCategories) {
      if (!this.params.restrictions.usageCategories.includes(context.category)) {
        return false;
      }
    }

    // Expiry check
    if (this.params.restrictions.expiryDate && 
        new Date() > this.params.restrictions.expiryDate) {
      return false;
    }

    return true;
  }

  private calculateDistance(
    point1: { lat: number; long: number },
    point2: { lat: number; long: number }
  ): number {
    // Haversine formula implementation for calculating distance between coordinates
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.long - point1.long);
    const lat1 = this.toRad(point1.lat);
    const lat2 = this.toRad(point2.lat);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * 
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}