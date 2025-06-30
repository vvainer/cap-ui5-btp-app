namespace com.sap.products;

entity Products {
  key ID: String(10);
  name: String(100) @mandatory;
  category: String(50);
  subCategory: String(50);
  supplier: String(50);
  imageUrl: String(200);
  availability: String(20) default 'In Stock';
  averageRating: Decimal(2,1);
  price: Decimal(10,2) @mandatory;
  currency: String(3) default 'USD';
  editingStatus: String(20) default 'Published';
  createdAt: Timestamp @cds.on.insert: $now;
  modifiedAt: Timestamp @cds.on.insert: $now @cds.on.update: $now;
}

entity Categories {
  key code: String(20);
  name: String(50) @mandatory;
  description: String(200);
}

entity Suppliers {
  key code: String(20);
  name: String(100) @mandatory;
  contactEmail: String(100);
  contactPhone: String(20);
  address: String(200);
}
