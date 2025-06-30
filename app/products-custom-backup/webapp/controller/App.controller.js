sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.sap.products.app.controller.App", {
        onInit: function () {
            // Load products on initialization
            this.onLoadProducts();
        },

        onLoadProducts: function () {
            var oModel = this.getView().getModel();
            var oTable = this.byId("productsTable");
            
            // Show loading indicator
            oTable.setBusy(true);
            
            // Bind the table to the Products entity
            oTable.bindItems({
                path: "/Products",
                template: oTable.getBindingInfo("items").template
            });
            
            // Update product count after binding
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.attachDataReceived(function(oEvent) {
                    var iCount = oEvent.getParameter("data") ? oEvent.getParameter("data").value.length : 0;
                    this.byId("productCount").setText("Total Products: " + iCount);
                    oTable.setBusy(false);
                }.bind(this));
            }
            
            MessageToast.show("Products loaded successfully!");
        },

        onRefresh: function () {
            var oModel = this.getView().getModel();
            oModel.refresh();
            this.onLoadProducts();
            MessageToast.show("Data refreshed!");
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
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
                    
                    // Update count for filtered results
                    oBinding.attachDataReceived(function(oEvent) {
                        var iCount = oEvent.getParameter("data") ? oEvent.getParameter("data").value.length : 0;
                        this.byId("productCount").setText("Filtered Products: " + iCount);
                    }.bind(this));
                } else {
                    oBinding.filter([]);
                    // Update count for all results
                    oBinding.attachDataReceived(function(oEvent) {
                        var iCount = oEvent.getParameter("data") ? oEvent.getParameter("data").value.length : 0;
                        this.byId("productCount").setText("Total Products: " + iCount);
                    }.bind(this));
                }
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
