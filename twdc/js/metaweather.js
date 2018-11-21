(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();
 
    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        // define columns in the table
        var cols = [{
            id: "applicable_date",
            dataType: tableau.dataTypeEnum.date,
            alias: "Date"
        }, {
            id: "weather_state_name",
            dataType: tableau.dataTypeEnum.string,
            alias: "Weather State"
        }, {
            id: "min_temp",
            dataType: tableau.dataTypeEnum.float,
            alias: "Min Temp"
        }, {
            id: "max_temp",
            dataType: tableau.dataTypeEnum.float,
            alias: "Max Temp"
        }];
 
        var tableSchema = {
            id: "metaweather",
            alias: "MetaWeather - Chicago IL",
            columns: cols
        };
 
        schemaCallback([tableSchema]);
    };
 
    // Download the data
    myConnector.getData = function(table, doneCallback) {
         
        // Change the url in the getJSON() function to point at your API
        $.getJSON("https://metaweather.com/api/location/2379574/", function(resp) {
            var feat = resp.consolidated_weather,
                tableData = [];
 
            // Update getData() function to iterate through your API response array
            for (var i = 0, len = feat.length; i < len; i++) {  
                // Update getData() function with correct field names
                tableData.push({
                    "applicable_date": feat[i].applicable_date, 
                    "weather_state_name": feat[i].weather_state_name, 
                    "min_temp": feat[i].min_temp, 
                    "max_temp": feat[i].max_temp
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
            tableau.connectionName = "MetaWeather - Chicago IL"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();