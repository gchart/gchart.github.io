(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        // define columns in the table
        var cols = [{
            id: "applicable_date",
            alias: "Date",
            dataType: tableau.dataTypeEnum.date
        }, {
            id: "min_temp",
            alias: "Min Temp",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "max_temp",
            alias: "Max Temp",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "weather_state_name",
            alias: "Weather Conditions",
            dataType: tableau.dataTypeEnum.string
        }];

        var tableSchema = {
            id: "metaWeather",
            alias: "MetaWeather data for Chicago IL",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        $.getJSON("https://www.metaweather.com/api/location/2379574/", function(resp) {
            var feat = resp.consolidated_weather,
                tableData = [];

            // Iterate over the JSON object
            for (var i = 0, len = feat.length; i < len; i++) {
                tableData.push({
                    "applicable_date": feat[i].applicable_date,
                    "min_temp": feat[i].min_temp,
                    "max_temp": feat[i].max_temp,
                    "weather_state_name": feat[i].weather_state_name
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