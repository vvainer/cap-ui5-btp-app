sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Button",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, Filter, FilterOperator, Dialog, List, StandardListItem, Button, Fragment) {
    "use strict";

    return Controller.extend("com.sap.products.app.controller.App", {
        onInit: function () {
            // Initialize the view and set up initial product count
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                // Set up event handler for initial data load
                var fnInitialDataReceived = function(oEvent) {
                    this._updateProductCount();
                    oBinding.detachDataReceived(fnInitialDataReceived);
                }.bind(this);
                
                oBinding.attachDataReceived(fnInitialDataReceived);
            }
            
            // Set initial count
            setTimeout(function() {
                this._updateProductCount();
            }.bind(this), 500);
        },

        onLoadProducts: function () {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                // Show loading indicator
                oTable.setBusy(true);
                
                // Refresh the binding
                oBinding.refresh();
                
                // Set up one-time event handler for data received
                var fnDataReceived = function(oEvent) {
                    oTable.setBusy(false);
                    this._updateProductCount();
                    oBinding.detachDataReceived(fnDataReceived);
                    MessageToast.show("Products loaded successfully!");
                }.bind(this);
                
                // Set up one-time event handler for data request failed
                var fnDataRequestFailed = function(oEvent) {
                    oTable.setBusy(false);
                    oBinding.detachDataRequestFailed(fnDataRequestFailed);
                    MessageToast.show("Failed to load products. Please try again.");
                }.bind(this);
                
                oBinding.attachDataReceived(fnDataReceived);
                oBinding.attachDataRequestFailed(fnDataRequestFailed);
                
                // Fallback: Clear busy state after timeout
                setTimeout(function() {
                    if (oTable.getBusy()) {
                        oTable.setBusy(false);
                        console.warn("Cleared busy state due to timeout");
                    }
                }, 10000); // 10 second timeout
            } else {
                MessageToast.show("Table binding not found. Please refresh the page.");
            }
        },

        onRefresh: function () {
            var oModel = this.getView().getModel();
            if (oModel) {
                oModel.refresh();
            }
            this.onLoadProducts();
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || 
                        oEvent.getParameter("newValue") || 
                        oEvent.getSource().getValue();
            this._applyAllFilters();
        },

        onFilterChange: function () {
            // Apply filters when any filter control changes
            this._applyAllFilters();
        },

        onApplyFilters: function () {
            // Explicitly apply all filters when Go button is pressed
            this._applyAllFilters();
            MessageToast.show("Filters applied");
        },

        onAdaptFilters: function () {
            MessageToast.show("Adapt Filters functionality - to be implemented");
        },

        onSupplierValueHelp: function () {
            var oView = this.getView();
            
            if (!this._supplierDialog) {
                this._supplierDialog = new Dialog({
                    title: "Select Supplier",
                    contentWidth: "400px",
                    contentHeight: "300px",
                    content: new List({
                        mode: "SingleSelect",
                        items: {
                            path: "/Suppliers",
                            template: new StandardListItem({
                                title: "{name}",
                                press: this._onSupplierSelect.bind(this)
                            })
                        }
                    }),
                    beginButton: new Button({
                        text: "Close",
                        press: function () {
                            this._supplierDialog.close();
                        }.bind(this)
                    })
                });
                oView.addDependent(this._supplierDialog);
            }
            
            this._supplierDialog.open();
        },

        _onSupplierSelect: function (oEvent) {
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext();
            var sSupplierName = oContext.getProperty("name");
            
            this.byId("supplierFilter").setValue(sSupplierName);
            this._supplierDialog.close();
            this._applyAllFilters();
        },

        _applyAllFilters: function () {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return;
            }

            var aFilters = [];

            // Search filter
            var sSearchQuery = this.byId("searchField").getValue();
            if (sSearchQuery && sSearchQuery.length > 0) {
                var aSearchFilters = [
                    new Filter("name", FilterOperator.Contains, sSearchQuery),
                    new Filter("category", FilterOperator.Contains, sSearchQuery),
                    new Filter("supplier", FilterOperator.Contains, sSearchQuery),
                    new Filter("ID", FilterOperator.Contains, sSearchQuery)
                ];
                var oSearchFilter = new Filter({
                    filters: aSearchFilters,
                    and: false
                });
                aFilters.push(oSearchFilter);
            }

            // Category filter
            var sCategoryKey = this.byId("categoryFilter").getSelectedKey();
            if (sCategoryKey && sCategoryKey !== "All") {
                aFilters.push(new Filter("category", FilterOperator.EQ, sCategoryKey));
            }

            // Editing Status filter
            var sEditingStatusKey = this.byId("editingStatusFilter").getSelectedKey();
            if (sEditingStatusKey && sEditingStatusKey !== "All") {
                aFilters.push(new Filter("editingStatus", FilterOperator.EQ, sEditingStatusKey));
            }

            // Supplier filter
            var sSupplierValue = this.byId("supplierFilter").getValue();
            if (sSupplierValue && sSupplierValue.length > 0) {
                aFilters.push(new Filter("supplier", FilterOperator.Contains, sSupplierValue));
            }

            // Rating filter
            var sRatingKey = this.byId("ratingFilter").getSelectedKey();
            if (sRatingKey && sRatingKey !== "All") {
                var fMinRating = parseFloat(sRatingKey);
                aFilters.push(new Filter("averageRating", FilterOperator.GE, fMinRating));
            }

            // Price Range filter
            var sPriceRangeKey = this.byId("priceRangeFilter").getSelectedKey();
            if (sPriceRangeKey && sPriceRangeKey !== "All") {
                var aPriceRange = this._parsePriceRange(sPriceRangeKey);
                if (aPriceRange.min !== null) {
                    aFilters.push(new Filter("price", FilterOperator.GE, aPriceRange.min));
                }
                if (aPriceRange.max !== null) {
                    aFilters.push(new Filter("price", FilterOperator.LE, aPriceRange.max));
                }
            }

            // Apply all filters
            oBinding.filter(aFilters);
            
            // Update count after filtering
            this._updateProductCount();
        },

        _parsePriceRange: function (sPriceRange) {
            var oRange = { min: null, max: null };
            
            switch (sPriceRange) {
                case "0-100":
                    oRange.min = 0;
                    oRange.max = 100;
                    break;
                case "100-500":
                    oRange.min = 100;
                    oRange.max = 500;
                    break;
                case "500-1000":
                    oRange.min = 500;
                    oRange.max = 1000;
                    break;
                case "1000-2000":
                    oRange.min = 1000;
                    oRange.max = 2000;
                    break;
                case "2000+":
                    oRange.min = 2000;
                    break;
            }
            
            return oRange;
        },

        _updateProductCount: function() {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var oProductCount = this.byId("productCount");
            var oProductsTitle = this.byId("productsTitle");
            
            if (oBinding && oProductCount) {
                // Use a timeout to allow binding to update
                setTimeout(function() {
                    try {
                        // Try different methods to get the count
                        var iLength = oBinding.getLength();
                        
                        // If getLength doesn't work, count the contexts
                        if (iLength === undefined || iLength < 0) {
                            var aContexts = oBinding.getContexts();
                            iLength = aContexts ? aContexts.length : 0;
                        }
                        
                        // If still no count, try counting table items
                        if (iLength === undefined || iLength < 0) {
                            var aItems = oTable.getItems();
                            iLength = aItems ? aItems.length : 0;
                        }
                        
                        if (iLength !== undefined && iLength >= 0) {
                            var sCountText = "(" + iLength + ")";
                            var sTitleText = oBinding.isFiltered() ? 
                                "Filtered Products " + sCountText : 
                                "Products " + sCountText;
                            
                            oProductsTitle.setText(sTitleText);
                            oProductCount.setText("");
                        } else {
                            oProductsTitle.setText("Products (0)");
                            oProductCount.setText("");
                        }
                    } catch (e) {
                        console.warn("Error updating product count:", e);
                        oProductsTitle.setText("Products");
                        oProductCount.setText("");
                    }
                }, 200);
            }
        },

        onItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            if (oContext) {
                var oProduct = oContext.getObject();
                MessageToast.show("Selected: " + oProduct.name + " (ID: " + oProduct.ID + ")");
            }
        },

        formatPrice: function (sPrice, sCurrency) {
            if (sPrice && sCurrency) {
                return parseFloat(sPrice).toFixed(2) + " " + sCurrency;
            }
            return "";
        },

        formatAvailabilityState: function (sAvailability) {
            switch (sAvailability) {
                case "In Stock":
                    return "Success";
                case "Out of Stock":
                    return "Error";
                case "Limited Stock":
                    return "Warning";
                default:
                    return "None";
            }
        },

        formatEditingStatusState: function (sStatus) {
            switch (sStatus) {
                case "Published":
                    return "Success";
                case "Draft":
                    return "Warning";
                case "Archived":
                    return "Error";
                default:
                    return "None";
            }
        }
    });
});
