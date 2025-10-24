import { apiService } from './SecureApiService.js';

// Input validation schemas
// Input validation schema for Station
const stationValidationSchema = {
  name: { required: true, minLength: 3, maxLength: 100 },
  location: { required: true, minLength: 3, maxLength: 250 },
  // coordinates must be present as [longitude, latitude]
  coordinates: { required: true, type: 'array' },
  type: { required: true }, // must be "AC" or "DC"
  availableSlots: { required: true, type: 'number', min: 0 },
  isActive: { required: false, type: 'boolean' } // optional
};


// Validation utility
const validateInput = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (!value && value !== 0)) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value) {
      if (rules.type === 'number' && isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }

      // basic array validation for coordinates
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      // additional coordinates checks
      if (field === 'coordinates' && Array.isArray(value)) {
        if (value.length !== 2) {
          errors.push('coordinates must be an array of [longitude, latitude]');
        } else {
          const [lng, lat] = value;
          if (isNaN(Number(lng)) || Number(lng) < -180 || Number(lng) > 180) {
            errors.push('longitude must be a valid number between -180 and 180');
          }
          if (isNaN(Number(lat)) || Number(lat) < -90 || Number(lat) > 90) {
            errors.push('latitude must be a valid number between -90 and 90');
          }
        }
      }
      
      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
      
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors.push(`${field} must be no more than ${rules.max}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced Station Service with Security
export default class EnhancedStationService {
  static endpoint = '/Station';
  
  // Get all stations with optional filtering and pagination
  static async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.location) queryParams.append('location', params.location);
      if (params.available !== undefined) queryParams.append('available', params.available);
      
      const url = `${this.endpoint}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiService.client.get(url);
      
      return {
        success: true,
        data: response.data,
        meta: response.headers
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch stations',
        code: error.response?.status
      };
    }
  }
  
  // Get single station with error handling
  static async getById(id) {
    try {
      if (!id) {
        throw new Error('Station ID is required');
      }
      
      const response = await apiService.client.get(`${this.endpoint}/${id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch station',
        code: error.response?.status
      };
    }
  }
  
  // Create station with validation
  static async create(stationData) {
    try {
      // Input validation
      const validation = validateInput(stationData, stationValidationSchema);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      // Sanitize data (remove any potentially harmful fields)
      const sanitizedData = this.sanitizeStationData(stationData);
      
      const response = await apiService.client.post(this.endpoint, sanitizedData);
      
      return {
        success: true,
        data: response.data,
        message: 'Station created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create station',
        code: error.response?.status
      };
    }
  }
  
  // Update station with validation
  static async update(id, stationData) {
    try {
      if (!id) {
        throw new Error('Station ID is required');
      }
      
      // Partial validation (only validate provided fields)
      const providedFields = Object.keys(stationData);
      const partialSchema = {};
      
      providedFields.forEach(field => {
        if (stationValidationSchema[field]) {
          partialSchema[field] = { 
            ...stationValidationSchema[field], 
            required: false // Make all optional for updates
          };
        }
      });
      
      const validation = validateInput(stationData, partialSchema);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }
      
      const sanitizedData = this.sanitizeStationData(stationData);
      const response = await apiService.client.put(`${this.endpoint}/${id}`, sanitizedData);
      
      return {
        success: true,
        data: response.data,
        message: 'Station updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update station',
        code: error.response?.status
      };
    }
  }
  
  // Deactivate station
  static async deactivate(id) {
    try {
      if (!id) {
        throw new Error('Station ID is required');
      }
      
      const response = await apiService.client.patch(`${this.endpoint}/${id}`, {
        isActive: false
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Station deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to deactivate station',
        code: error.response?.status
      };
    }
  }
  
  // Activate station
  static async activate(id) {
    try {
      if (!id) {
        throw new Error('Station ID is required');
      }
      
      const response = await apiService.client.patch(`${this.endpoint}/${id}`, {
        isActive: true
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Station activated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to activate station',
        code: error.response?.status
      };
    }
  }
  
  // Delete station with confirmation (only allows deleting inactive stations)
  static async delete(id, confirmationToken = null) {
    try {
      if (!id) {
        throw new Error('Station ID is required');
      }
      
      const headers = {};
      if (confirmationToken) {
        headers['X-Confirm-Delete'] = confirmationToken;
      }
      
      await apiService.client.delete(`${this.endpoint}/${id}`, { headers });
      
      return {
        success: true,
        message: 'Station deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete station',
        code: error.response?.status
      };
    }
  }
  
  // Sanitize input data
  static sanitizeStationData(data) {
  const allowedFields = ["id", "name", "location", "coordinates", "type", "availableSlots", "isActive"];
    const sanitized = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        // Basic XSS prevention - strip HTML tags
        if (typeof data[field] === 'string') {
          sanitized[field] = data[field].replace(/<[^>]*>/g, '').trim();
        } else {
          sanitized[field] = data[field];
        }
      }
    });
    
    return sanitized;
  }
  
  // Batch operations with rate limiting
  static async batchCreate(stations, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < stations.length; i += batchSize) {
      const batch = stations.slice(i, i + batchSize);
      
      const batchPromises = batch.map(station => this.create(station));
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
      ));
      
      // Rate limiting - wait between batches
      if (i + batchSize < stations.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}