const cds = require('@sap/cds/lib');
const { expect } = require('chai');

describe('Products Service', () => {
  let service;
  
  before(async () => {
    // Connect to the service
    service = await cds.connect.to('ProductsService');
  });

  describe('Product Creation', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        ID: 'TEST-001',
        name: 'Test Product',
        category: 'Laptops',
        supplier: 'Test Supplier',
        price: 99.99,
        currency: 'USD',
        availability: 'In Stock',
        editingStatus: 'Published'
      };

      const product = await service.create('Products', productData);
      expect(product.ID).to.equal('TEST-001');
      expect(product.name).to.equal('Test Product');
      expect(product.price).to.equal(99.99);
    });

    it('should reject product with duplicate ID', async () => {
      const productData = {
        ID: 'HT-1000', // This ID already exists in sample data
        name: 'Duplicate Product',
        price: 50.00
      };

      try {
        await service.create('Products', productData);
        expect.fail('Should have thrown an error for duplicate ID');
      } catch (error) {
        expect(error.message).to.include('already exists');
      }
    });

    it('should reject product with invalid price', async () => {
      const productData = {
        ID: 'TEST-002',
        name: 'Invalid Price Product',
        price: -10.00
      };

      try {
        await service.create('Products', productData);
        expect.fail('Should have thrown an error for invalid price');
      } catch (error) {
        expect(error.message).to.include('Price must be greater than 0');
      }
    });

    it('should reject product with invalid rating', async () => {
      const productData = {
        ID: 'TEST-003',
        name: 'Invalid Rating Product',
        price: 100.00,
        averageRating: 6.0 // Invalid rating > 5.0
      };

      try {
        await service.create('Products', productData);
        expect.fail('Should have thrown an error for invalid rating');
      } catch (error) {
        expect(error.message).to.include('Average rating must be between 1.0 and 5.0');
      }
    });
  });

  describe('Product Reading', () => {
    it('should read all products', async () => {
      const products = await service.read('Products');
      expect(products).to.be.an('array');
      expect(products.length).to.be.greaterThan(0);
    });

    it('should read a specific product by ID', async () => {
      const product = await service.read('Products', 'HT-1000');
      expect(product).to.be.an('object');
      expect(product.ID).to.equal('HT-1000');
      expect(product.name).to.equal('Notebook Basic 15');
    });

    it('should enrich product data with computed fields', async () => {
      const product = await service.read('Products', 'HT-1000');
      expect(product.formattedPrice).to.include('USD');
      expect(product.availabilityStatus).to.equal('Success');
      expect(product.editingStatusColor).to.equal('Success');
    });
  });

  describe('Product Update', () => {
    it('should update a product with valid data', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 150.00
      };

      await service.update('Products', 'HT-1000', updateData);
      const updatedProduct = await service.read('Products', 'HT-1000');
      expect(updatedProduct.name).to.equal('Updated Product Name');
      expect(updatedProduct.price).to.equal(150.00);
    });

    it('should reject update with invalid price', async () => {
      const updateData = {
        price: -50.00
      };

      try {
        await service.update('Products', 'HT-1000', updateData);
        expect.fail('Should have thrown an error for invalid price');
      } catch (error) {
        expect(error.message).to.include('Price must be greater than 0');
      }
    });
  });

  describe('Product Deletion', () => {
    it('should delete a product', async () => {
      // First create a product to delete
      const productData = {
        ID: 'TEST-DELETE',
        name: 'Product to Delete',
        price: 25.00
      };

      await service.create('Products', productData);
      
      // Then delete it
      await service.delete('Products', 'TEST-DELETE');
      
      // Verify it's deleted
      const deletedProduct = await service.read('Products', 'TEST-DELETE');
      expect(deletedProduct).to.be.null;
    });
  });

  describe('Categories and Suppliers', () => {
    it('should read all categories', async () => {
      const categories = await service.read('Categories');
      expect(categories).to.be.an('array');
      expect(categories.length).to.be.greaterThan(0);
    });

    it('should read all suppliers', async () => {
      const suppliers = await service.read('Suppliers');
      expect(suppliers).to.be.an('array');
      expect(suppliers.length).to.be.greaterThan(0);
    });
  });

  after(async () => {
    // Clean up test data
    try {
      await service.delete('Products', 'TEST-001');
      await service.delete('Products', 'TEST-002');
      await service.delete('Products', 'TEST-003');
    } catch (error) {
      // Ignore cleanup errors
    }
  });
});
