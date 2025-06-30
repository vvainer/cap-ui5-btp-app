sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, Filter, FilterOperator) {
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
            this._applySearchFilter(sQuery);
        },

        onClearSearch: function () {
            this.byId("searchField").setValue("");
            this._applySearchFilter("");
        },

        _applySearchFilter: function (sQuery) {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                if (sQuery && sQuery.length > 0) {
                    var aFilters = [
                        new Filter("name", FilterOperator.Contains, sQuery),
                        new Filter("category", FilterOperator.Contains, sQuery),
                        new Filter("supplier", FilterOperator.Contains, sQuery),
                        new Filter("ID", FilterOperator.Contains, sQuery)
                    ];
                    var oFilter = new Filter({
                        filters: aFilters,
                        and: false
                    });
                    oBinding.filter([oFilter]);
                } else {
                    oBinding.filter([]);
                }
                
                // Update count after filtering
                this._updateProductCount();
            }
        },

        _updateProductCount: function() {
            var oTable = this.byId("productsTable");
            var oBinding = oTable.getBinding("items");
            var oProductCount = this.byId("productCount");
            
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
                            var sText = oBinding.isFiltered() ? 
                                "Filtered Products: " + iLength : 
                                "Total Products: " + iLength;
                            oProductCount.setText(sText);
                        } else {
                            oProductCount.setText("Products: 0");
                        }
                    } catch (e) {
                        console.warn("Error updating product count:", e);
                        oProductCount.setText("Products");
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
