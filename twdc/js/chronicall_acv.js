(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

	myConnector.init = function(initCallback) {
		tableau.authType = tableau.authTypeEnum.basic;
		initCallback();
	}

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
    	
        var cols = [{
            id: "agent",
            alias: "Agent",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "date",
            alias: "CallDate",
            dataType: tableau.dataTypeEnum.date
        }, {
            id: "inbound_calls",
            alias: "Inbound Calls",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "outbound_calls",
            alias: "Outbound Calls",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "internal_calls",
            alias: "Internal Calls",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "inbound_duration",
            alias: "Inbound Duration",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "outbound_duration",
            alias: "Outbound Duration",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "internal_duration",
            alias: "Internal Duration",
            dataType: tableau.dataTypeEnum.int
        }];

        var tableSchema = {
            id: "agent_call_volume",
            alias: "Chronicall - Agent Call Volume",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
    
    	params = JSON.parse(tableau.connectionData);
    
    	console.log('Start Date: ' + params.startDate);
    	console.log('End Date: ' + params.endDate);
    	console.log('REST URL: ' + params.restUrl);
    	console.log('Role ID: ' + params.roleId);
    	console.log('Token: ' + tableau.password);
    	
		var startDate = new Date(params.startDate + ' 00:00:00 UTC-06:00'); // CST... dont worry about DST
		var endDate   = new Date(params.endDate   + ' 23:59:59 UTC-06:00'); // CST... dont worry about DST
		var curDate   = new Date(); // current date

		if(endDate > curDate) {
			endDate = curDate;
			console.log('Adjusted endDate to curDate');
		}
    	
    	var payload = 
			{
			  "format": "JSON",
			  "parameters": [
				{
				  "name": "Report Timeframe",
				  "required": false,
				  "editable": true,
				  "valueType": "REPORT_TIMEFRAME",
				  "value": {
					"type": "REPORT_TIMEFRAME",
					//"start": params.startDate + "T00:00:00-06:00",
					//"end": params.endDate + "T23:59:59-06:00",
					"start": startDate.toISOString(),
					"end": endDate.toISOString(),
					"shift": {
					  "startTime": "00:00:00",
					  "endTime": "23:59:59"
					}
				  }
				},
				{
				  "name": "Rows (Time)",
				  "required": false,
				  "editable": true,
				  "valueType": "TIME_ROW",
				  "value": {
					"type": "TIME_ROW",
					"intervalLength": 1,
					"intervalType": "DAYS"
				  }
				},
				{
				  "name": "Agent",
				  "criteriaParameters": {
					"filter": "REPORTS",
					"type": "PBX_USERS"
				  },
				  "required": true,
				  "editable": true,
				  "valueType": "PBX_USERS",
				  "value": {
					"type": "PBX_USERS",
					"roles": [
					  {
						"key": params.roleId
					  }
					]
				  },
				  "subGroupSelection": true
				}
			  ]
			};
    
		var settings = {
		  "url": params.restUrl,
		  "method": "POST",
		  "timeout": 0,
		  "dataType": "json",
		  "headers": {
			"Content-Type": ["application/json"],
			"Authorization": "Bearer " + tableau.password
		  },
		  "data": JSON.stringify(payload)

		};


		var t0 = performance.now();

		$.ajax(settings).done(function (response) {
			console.log("Length: " + response.subReports.length);
            var tableData = [];

            // Iterate over the list array of Agents (people)
            for (var agent = 0, num_agents = response.subReports.length; agent < num_agents; agent++) {
                for (var day = 0, num_days = response.subReports[agent].rows.length; day < num_days; day++) {
                  tableData.push({
                    "agent": response.subReports[agent].title,
                    "date": response.subReports[agent].rows[day].values["0"].value,
                    "inbound_calls": response.subReports[agent].rows[day].values["2"].value,
                    "outbound_calls": response.subReports[agent].rows[day].values["3"].value,
                    "internal_calls": response.subReports[agent].rows[day].values["4"].value,
                    "inbound_duration": response.subReports[agent].rows[day].values["6"].value,
                    "outbound_duration": response.subReports[agent].rows[day].values["7"].value,
                    "internal_duration": response.subReports[agent].rows[day].values["8"].value         	
                  });
                }
            }

            table.appendRows(tableData);
            
            var t1 = performance.now()
            console.log("Data query took " + (t1 - t0)/1000 + " seconds.")
		
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            var dateObj = {
                startDate: $('#start-date').val().trim(),
                endDate: $('#end-date').val().trim(),
                roleId: $('#role-id').val().trim(),
                restUrl: $('#rest-url').val().trim(),
            };

            // Simple date validation: Call the getDate function on the date object created
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(dateObj.startDate) && isValidDate(dateObj.endDate)) {
                tableau.connectionData = JSON.stringify(dateObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.password = $('#token').val().trim();
                tableau.connectionName = "Chronicall - Agent Call Volume"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2016-05-08.");
            }
        });
    });
})();
