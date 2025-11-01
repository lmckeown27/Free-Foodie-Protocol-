const { Pool } = require('pg');
const logger = require('./utils/logger');

/**
 * Inventory Normalizer
 * 
 * Responsibilities:
 * 1. Normalize supplier inventory data (units, types, formats)
 * 2. Verify data integrity
 * 3. Check compliance (expiration dates, handling requirements)
 * 4. Standardize item types and categories
 */

class InventoryNormalizer {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Standard item type mappings
    this.itemTypeMap = {
      'fruit': 'produce',
      'fruits': 'produce',
      'vegetable': 'produce',
      'vegetables': 'produce',
      'veggie': 'produce',
      'veggies': 'produce',
      'milk': 'dairy',
      'cheese': 'dairy',
      'yogurt': 'dairy',
      'beef': 'meat',
      'chicken': 'meat',
      'pork': 'meat',
      'fish': 'meat',
      'bread': 'grains',
      'rice': 'grains',
      'pasta': 'grains',
      'cereal': 'grains',
      'canned food': 'canned',
      'canned goods': 'canned',
      'soup': 'canned',
      'juice': 'beverages',
      'water': 'beverages',
      'soda': 'beverages'
    };
    
    // Standard unit conversions
    this.unitConversions = {
      'pound': 'lbs',
      'pounds': 'lbs',
      'lb': 'lbs',
      'ounce': 'oz',
      'ounces': 'oz',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'gram': 'g',
      'grams': 'g',
      'gallon': 'gal',
      'gallons': 'gal',
      'quart': 'qt',
      'quarts': 'qt',
      'liter': 'L',
      'liters': 'L',
      'piece': 'count',
      'pieces': 'count',
      'item': 'count',
      'items': 'count'
    };
  }
  
  /**
   * Normalize raw inventory data from supplier
   */
  async normalize(rawData) {
    logger.info('Normalizing inventory data', { raw: rawData });
    
    try {
      const normalized = {
        item_name: this.normalizeItemName(rawData.item_name),
        item_type: this.normalizeItemType(rawData.item_type || rawData.category),
        quantity: this.normalizeQuantity(rawData.quantity),
        unit: this.normalizeUnit(rawData.unit),
        expiration_date: this.normalizeExpirationDate(rawData.expiration_date || rawData.exp_date),
        location: rawData.location || 'Main Pantry',
        handling_notes: rawData.handling_notes || rawData.notes || '',
        supplier_id: rawData.supplier_id
      };
      
      // Validate normalized data
      this.validateNormalizedData(normalized);
      
      logger.info('Inventory data normalized successfully', { normalized });
      return normalized;
    } catch (error) {
      logger.error('Inventory normalization failed', error);
      throw error;
    }
  }
  
  /**
   * Normalize item name (trim, capitalize)
   */
  normalizeItemName(name) {
    if (!name) throw new Error('Item name is required');
    return name.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Normalize item type to standard categories
   */
  normalizeItemType(type) {
    if (!type) return 'other';
    
    const lowerType = type.toLowerCase().trim();
    return this.itemTypeMap[lowerType] || lowerType;
  }
  
  /**
   * Normalize quantity (ensure number)
   */
  normalizeQuantity(quantity) {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Invalid quantity: must be a positive number');
    }
    return qty;
  }
  
  /**
   * Normalize unit to standard abbreviations
   */
  normalizeUnit(unit) {
    if (!unit) return 'count';
    
    const lowerUnit = unit.toLowerCase().trim();
    return this.unitConversions[lowerUnit] || lowerUnit;
  }
  
  /**
   * Normalize expiration date
   */
  normalizeExpirationDate(date) {
    if (!date) return null;
    
    try {
      const expDate = new Date(date);
      if (isNaN(expDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Check if date is in the past
      if (expDate < new Date()) {
        logger.warn('Expiration date is in the past', { date });
      }
      
      return expDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      logger.error('Failed to normalize expiration date', { date, error });
      return null;
    }
  }
  
  /**
   * Validate normalized data
   */
  validateNormalizedData(data) {
    const errors = [];
    
    if (!data.item_name) errors.push('Item name is required');
    if (!data.quantity || data.quantity <= 0) errors.push('Valid quantity is required');
    if (!data.unit) errors.push('Unit is required');
    if (!data.supplier_id) errors.push('Supplier ID is required');
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }
  
  /**
   * Verify inventory data integrity (check if inventory exists and is valid)
   */
  async verify(inventoryId) {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM inventory WHERE id = $1',
        [inventoryId]
      );
      
      if (result.rows.length === 0) {
        logger.warn('Inventory not found', { inventoryId });
        return { valid: false, reason: 'Inventory not found' };
      }
      
      const inventory = result.rows[0];
      const issues = [];
      
      // Check expiration
      if (inventory.expiration_date) {
        const expDate = new Date(inventory.expiration_date);
        const today = new Date();
        
        if (expDate < today) {
          issues.push('Item is expired');
        } else if ((expDate - today) / (1000 * 60 * 60 * 24) < 3) {
          issues.push('Item expires within 3 days');
        }
      }
      
      // Check quantity
      if (inventory.quantity <= 0) {
        issues.push('Quantity is zero or negative');
      }
      
      // Check status
      if (inventory.status === 'expired') {
        issues.push('Item marked as expired');
      }
      
      const valid = issues.length === 0;
      
      logger.info('Inventory verification complete', {
        inventoryId,
        valid,
        issues
      });
      
      return { valid, issues };
    } finally {
      client.release();
    }
  }
  
  /**
   * Check VLCP (Voluntary Local Community Pantry) compliance
   */
  async checkVLCPCompliance(inventoryId) {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM inventory WHERE id = $1',
        [inventoryId]
      );
      
      if (result.rows.length === 0) {
        return { compliant: false, reason: 'Inventory not found' };
      }
      
      const inventory = result.rows[0];
      const complianceIssues = [];
      
      // Check temperature requirements (if temperature_log exists)
      if (inventory.temperature_log) {
        const tempLog = inventory.temperature_log;
        if (tempLog.current_temp && (tempLog.current_temp < 35 || tempLog.current_temp > 40)) {
          complianceIssues.push('Temperature out of safe range (35-40°F for refrigerated items)');
        }
      }
      
      // Check handling notes for compliance keywords
      const requiredHandling = ['refrigerated', 'frozen', 'perishable'];
      const hasHandlingNotes = inventory.handling_notes && 
        requiredHandling.some(keyword => inventory.handling_notes.toLowerCase().includes(keyword));
      
      if (!hasHandlingNotes && ['dairy', 'meat', 'produce'].includes(inventory.item_type)) {
        complianceIssues.push('Missing handling instructions for perishable item');
      }
      
      const compliant = complianceIssues.length === 0;
      
      // Log compliance check
      await client.query(
        `INSERT INTO compliance_logs (inventory_id, compliance_type, passed, notes)
         VALUES ($1, 'VLCP', $2, $3)`,
        [inventoryId, compliant, complianceIssues.join('; ') || 'All checks passed']
      );
      
      return { compliant, issues: complianceIssues };
    } finally {
      client.release();
    }
  }
}

module.exports = InventoryNormalizer;

