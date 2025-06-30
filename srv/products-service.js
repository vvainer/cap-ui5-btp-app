const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const { Products, Categories, Suppliers } = this.entities;

  // Validation before creating a product
  this.before('CREATE', 'Products', async (req) => {
    const product = req.data;
    
    // Validate product ID uniqueness
    if (product.ID) {
      const existing = await SELECT.one.from(Products).where({ ID: product.ID });
      if (existing) {
        req.error(400, `Product with ID ${product.ID} already exists`);
      }
    }
    
    // Validate price
    if (product.price && product.price <= 0) {
      req.error(400, 'Price must be greater than 0');
    }
    
    // Validate rating
    if (product.averageRating && (product.averageRating < 1.0 || product.averageRating > 5.0)) {
      req.error(400, 'Average rating must be between 1.0 and 5.0');
    }
  });

  // Validation before updating a product
  this.before('UPDATE', 'Products', async (req) => {
    const product = req.data;
    
    // Validate price
    if (product.price && product.price <= 0) {
      req.error(400, 'Price must be greater than 0');
    }
    
    // Validate rating
    if (product.averageRating && (product.averageRating < 1.0 || product.averageRating > 5.0)) {
      req.error(400, 'Average rating must be between 1.0 and 5.0');
    }
  });

  // Enrich product data after reading
  this.after('READ', 'Products', (products) => {
    if (Array.isArray(products)) {
      products.forEach(product => {
        // Add computed fields or additional processing
        if (product.price && product.currency) {
          product.formattedPrice = `${product.currency} ${product.price.toFixed(2)}`;
        }
        
        // Add availability status color
        switch (product.availability) {
          case 'In Stock':
            product.availabilityStatus = 'Success';
            break;
          case 'Out of Stock':
            product.availabilityStatus = 'Error';
            break;
          case 'Limited Stock':
            product.availabilityStatus = 'Warning';
            break;
          default:
            product.availabilityStatus = 'None';
        }
        
        // Add editing status color
        switch (product.editingStatus) {
          case 'Published':
            product.editingStatusColor = 'Success';
            break;
          case 'Draft':
            product.editingStatusColor = 'Warning';
            break;
          case 'Archived':
            product.editingStatusColor = 'Error';
            break;
          default:
            product.editingStatusColor = 'None';
        }
      });
    } else if (products) {
      // Handle single product
      if (products.price && products.currency) {
        products.formattedPrice = `${products.currency} ${products.price.toFixed(2)}`;
      }
      
      switch (products.availability) {
        case 'In Stock':
          products.availabilityStatus = 'Success';
          break;
        case 'Out of Stock':
          products.availabilityStatus = 'Error';
          break;
        case 'Limited Stock':
          products.availabilityStatus = 'Warning';
          break;
        default:
          products.availabilityStatus = 'None';
      }
      
      switch (products.editingStatus) {
        case 'Published':
          products.editingStatusColor = 'Success';
          break;
        case 'Draft':
          products.editingStatusColor = 'Warning';
          break;
        case 'Archived':
          products.editingStatusColor = 'Error';
          break;
        default:
          products.editingStatusColor = 'None';
      }
    }
  });

  // Custom search implementation
  this.on('READ', 'Products', async (req, next) => {
    // Check if there's a search query
    const searchQuery = req.query.SELECT.where;
    
    if (searchQuery && searchQuery.some && searchQuery.some(condition => 
      condition.ref && condition.ref[0] === 'search')) {
      
      // Extract search term
      const searchTerm = searchQuery.find(condition => 
        condition.ref && condition.ref[0] === 'search').val;
      
      if (searchTerm) {
        // Perform fuzzy search across multiple fields
        const searchPattern = `%${searchTerm.toLowerCase()}%`;
        
        req.query.SELECT.where = [
          'or',
          { ref: ['name'] }, 'like', { val: searchPattern },
          { ref: ['category'] }, 'like', { val: searchPattern },
          { ref: ['supplier'] }, 'like', { val: searchPattern },
          { ref: ['ID'] }, 'like', { val: searchPattern }
        ];
      }
    }
    
    return next();
  });

  // Error handling for service operations
  this.on('error', (err, req) => {
    console.error('Service error:', err);
    
    // Customize error messages for better user experience
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      err.message = 'A product with this ID already exists';
    }
    
    return err;
  });
});
