(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();
 
    // ************************************************************
    // Update getSchema() function with correct fields and tables
    // Test in the Simulator
    // ************************************************************
    myConnector.getSchema = function(schemaCallback) {
        // define columns in the table
        var cols = [{
            id: "city",
            dataType: tableau.dataTypeEnum.string,
            alias: "City",
            description: "Some Cities"
        }, {
            id: "parameter",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "value",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "unit",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "date",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "latitude",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "longitude",
            dataType: tableau.dataTypeEnum.float
        }];
 
        var tableSchema = {
            id: "openaqsea",
            alias: "Open AQ Seattle",
            columns: cols
        };
 
        schemaCallback([tableSchema]);
    };
 
    // Download the data
    myConnector.getData = function(table, doneCallback) {
         
        // Change the url in the getJSON() function to point at your API
        $.getJSON("api.openaq.org/v1/measurements.json?date_from=2018-07-01&date_to=2018-10-31&parameter=pm25&coordinates=47.597,-122.3197&radius=200000", function(resp) {
            var feat = resp.results,
                tableData = [];
 
            // Update getData() function to iterate through your API response array
            for (var i = 0, len = feat.length; i < len; i++) {  
                // Update getData() function with correct field names
                tableData.push({
                    "city": feat[i].city, 
                    "parameter": feat[i].parameter, 
                    "value": feat[i].value, 
                    "unit": feat[i].unit, 
                    "date": new Date(feat[i].date.local), 
                    "latitude": feat[i].coordinates.latitude, 
                    "longitude": feat[i].coordinates.longitude
 
                });
            }
 
            table.appendRows(tableData);
            doneCallback();
        });
    };
 
    tableau.registerConnector(myConnector);
 
    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            tableau.connectionName = "Open AQ Seattle"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();