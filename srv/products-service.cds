using com.sap.products as products from '../db/schema';

service ProductsService {
  @odata.draft.enabled
  entity Products as projection on products.Products;
  
  entity Categories as projection on products.Categories;
  entity Suppliers as projection on products.Suppliers;
}

annotate ProductsService.Products with @(
  UI.LineItem: [
    {
      $Type: 'UI.DataField',
      Value: ID,
      Label: 'Product ID'
    },
    {
      $Type: 'UI.DataField',
      Value: name,
      Label: 'Product Name'
    },
    {
      $Type: 'UI.DataField',
      Value: category,
      Label: 'Category'
    },
    {
      $Type: 'UI.DataField',
      Value: supplier,
      Label: 'Supplier'
    },
    {
      $Type: 'UI.DataField',
      Value: price,
      Label: 'Price'
    },
    {
      $Type: 'UI.DataField',
      Value: averageRating,
      Label: 'Rating'
    },
    {
      $Type: 'UI.DataField',
      Value: availability,
      Label: 'Availability'
    },
    {
      $Type: 'UI.DataField',
      Value: editingStatus,
      Label: 'Status'
    }
  ],
  UI.SelectionFields: [
    category,
    supplier,
    availability,
    editingStatus
  ],
  UI.HeaderInfo: {
    TypeName: 'Product',
    TypeNamePlural: 'Products',
    Title: {
      $Type: 'UI.DataField',
      Value: name
    },
    Description: {
      $Type: 'UI.DataField',
      Value: ID
    }
  },
  UI.Facets: [
    {
      $Type: 'UI.ReferenceFacet',
      ID: 'GeneralInformation',
      Label: 'General Information',
      Target: '@UI.FieldGroup#GeneralInformation'
    },
    {
      $Type: 'UI.ReferenceFacet',
      ID: 'PricingInformation',
      Label: 'Pricing & Availability',
      Target: '@UI.FieldGroup#PricingInformation'
    }
  ],
  UI.FieldGroup#GeneralInformation: {
    Data: [
      {
        $Type: 'UI.DataField',
        Value: ID,
        Label: 'Product ID'
      },
      {
        $Type: 'UI.DataField',
        Value: name,
        Label: 'Product Name'
      },
      {
        $Type: 'UI.DataField',
        Value: category,
        Label: 'Category'
      },
      {
        $Type: 'UI.DataField',
        Value: subCategory,
        Label: 'Sub Category'
      },
      {
        $Type: 'UI.DataField',
        Value: supplier,
        Label: 'Supplier'
      },
      {
        $Type: 'UI.DataField',
        Value: imageUrl,
        Label: 'Image URL'
      }
    ]
  },
  UI.FieldGroup#PricingInformation: {
    Data: [
      {
        $Type: 'UI.DataField',
        Value: price,
        Label: 'Price'
      },
      {
        $Type: 'UI.DataField',
        Value: currency,
        Label: 'Currency'
      },
      {
        $Type: 'UI.DataField',
        Value: availability,
        Label: 'Availability'
      },
      {
        $Type: 'UI.DataField',
        Value: averageRating,
        Label: 'Average Rating'
      },
      {
        $Type: 'UI.DataField',
        Value: editingStatus,
        Label: 'Editing Status'
      }
    ]
  }
);

annotate ProductsService.Products with {
  ID @(
    title: 'Product ID',
    Common.FieldControl: #Mandatory
  );
  name @(
    title: 'Product Name',
    Common.FieldControl: #Mandatory
  );
  category @(
    title: 'Category',
    Common.ValueList: {
      CollectionPath: 'Categories',
      Parameters: [
        {
          $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: category,
          ValueListProperty: 'name'
        }
      ]
    }
  );
  supplier @(
    title: 'Supplier',
    Common.ValueList: {
      CollectionPath: 'Suppliers',
      Parameters: [
        {
          $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: supplier,
          ValueListProperty: 'name'
        }
      ]
    }
  );
  price @(
    title: 'Price',
    Common.FieldControl: #Mandatory
  );
  averageRating @(
    title: 'Average Rating'
  );
  availability @(
    title: 'Availability'
  );
  editingStatus @(
    title: 'Editing Status'
  );
}
