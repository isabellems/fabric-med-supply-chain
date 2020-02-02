// ==== Invoke packages ====
// peer chaincode invoke -C myc1 -n 



package main 

import (
       "fmt"
       "bytes"
       "strconv"
       "strings"
       "time"
       "encoding/json"
       "github.com/hyperledger/fabric/core/chaincode/shim"
        pb "github.com/hyperledger/fabric/protos/peer"
)

//Simple Chaincode implementation
type SimpleChaincode struct {
}

type location struct {
   ObjectType string `json:"docType"`
   Latitude  string `json:"latitude"`
   Longitude string `json:"longitude"`
}

type drugPackage struct {
   ObjectType string `json:"docType"`
   Id string `json:"id"`
   Name       string `json:"name"`
   Manufacturer string `json:"manufacturer"`
   Temperature float64  `json:"temperature"`
   Humidity float64  `json:"humidity"`
   Location location `json:"location"`
   Timestamp string `json:"timestamp"`
   Holder string `json:"holder"`
   Pieces int `json:"pieces"`
   dateCreated string `json:"datecreated"`
   dateShipped string `json:"dateshipped"`
}

// ===================================================================================
// Main
// ===================================================================================
func main() {
        err := shim.Start(new(SimpleChaincode))
        if err != nil {
                fmt.Printf("Error starting Simple chaincode: %s", err)
        }
}

//Initialize chaincode
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
  return shim.Success(nil)
}

//Invoke - Our entry point for Invocations
//========================================

func (t* SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
  function, args := stub.GetFunctionAndParameters()
  fmt.Println("invoke is running " + function)
  
  //Handle different functions
  if function == "initDrugPackage" { //create a new drug package
          return t.initDrugPackage(stub, args)
  } else if function == "moveDrugPackage" { //change the location of a drugPackage
          return t.moveDrugPackage(stub, args)
  } else if function == "transferDrugPackage" { //change the owner of a drugPackage
          return t.transferDrugPackage(stub, args)
  } else if function == "readDrugPackage" { //Read a drug package
          return t.readDrugPackage(stub, args)
  } else if function == "queryDrugPackageByManufacturer" { // find drugs made by manufacturer X using rich query
          return t.queryDrugPackageByManufacturer(stub, args)
  } else if function == "queryDrugPackageByName" { //find packages of a specific drug
          return t.queryDrugPackageByName(stub, args)
  } else if function == "queryDrugPackageByHolder" { //find packages currently having a specific holder
          return t.queryDrugPackageByHolder(stub, args)
  } else if function == "queryDrugPackages" {
	  return t.queryDrugPackages(stub, args)
  } else if function == "getHistoryForDrugPackage" {
	  return t.getHistoryForDrugPackage(stub, args)
  } else if function == "deleteDrugPackage" {
	  return t.deleteDrugPackage(stub, args)
  }


  fmt.Println("invoke did not find func: " + function) //error
  return shim.Error("Received unknown function invocation")
}

//=======================================================================
// initDrugPackage - create a new drug package, store into chaincode state
//=======================================================================

func (t *SimpleChaincode) initDrugPackage(stub shim.ChaincodeStubInterface, args []string) pb.Response {
   // Id, DrugName, Manufacturer, Temperature, Humidity, LocationLatitutde, LocationLongitude, Holder, Pieces, Timestamp
   var err error


   if len(args) != 10 {
      return shim.Error("Incorrect number of arguments. Expecting 9")
   }
   if len(args[0]) <= 0 {
       return shim.Error("1st argument must be a non-empty string")
   }
   if len(args[1]) <= 0 {
       return shim.Error("2nd argument must be a non-empty string")
   }
   if len(args[2]) <= 0 {
       return shim.Error("3rd argument must be a non-empty string")
   }
   if len(args[3]) <= 0 {
       return shim.Error("4th argument must be a non-empty string")
   }
   if len(args[4]) <= 0 {
       return shim.Error("5th argument must be a non-empty string")
   }
   if len(args[5]) <= 0 {
       return shim.Error("6th argument must be a non-empty string")
   }
   if len(args[6]) <= 0 {
       return shim.Error("7th argument must be a non-empty string")
   }
   if len(args[7]) <= 0 {
       return shim.Error("8th argument must be a non-empty string")
   }
   if len(args[8]) <= 0 {
       return shim.Error("9th argument must be a non-empty string")
   }
   if len(args[9]) <= 0 {
       return shim.Error("10th argument must be a non-empty string")
   }
   
   drugPackageId := args[0]
   drugName := args[1]
   drugManufacturer := args[2]
   drugTemperature, err := strconv.ParseFloat(args[3], 64)
   drugTemperature = float64(drugTemperature)
   if err != nil {
          return shim.Error("4th argument must be a numeric string")
   }    
   
   drugHumidity, err := strconv.ParseFloat(args[4], 64)
   drugHumidity = float64(drugHumidity)
   if err != nil {
          return shim.Error("5th argument must be a numeric string")
   } 

   drugLocationLatitude := args[5]
   drugLocationLongitude := args[6]
   drugHolder := args[7]
   drugPieces, err := strconv.Atoi(args[8])
   if err != nil {
          return shim.Error("9th argument must be a numeric string")
   } 

   // ==== Check if drug Package with the same id ====
   drugPackageAsBytes, err := stub.GetState(drugPackageId)
   if err != nil {
	   return shim.Error("Failed to get package: " + err.Error())
   } else if drugPackageAsBytes != nil {
	   fmt.Println("A package with the id " + drugPackageId + " already exists")
	   return shim.Error("A package with the id " + drugPackageId + " already exists")
   }
   
   drugTimestamp := args[9]
   drugDateCreated := drugTimestamp
   drugDateShipped := "0"
   
   // ==== Create Location object and marshal to JSON ====
   objectType := "location"
   drugLocation := location{objectType, drugLocationLatitude, drugLocationLongitude} 
   // ==== Create drugPackage object and marshal to JSON ====
   objectType = "drugPackage"
   drugPackage := &drugPackage{objectType, drugPackageId, drugName, drugManufacturer, drugTemperature, drugHumidity, drugLocation, drugTimestamp, drugHolder, drugPieces, drugDateCreated, drugDateShipped}
   drugPackageJSONasBytes, err := json.Marshal(drugPackage)
   if err !=nil {
	   return shim.Error(err.Error())
   }
    
   // ==== Save drugPackage to state ====

   err = stub.PutState(drugPackageId, drugPackageJSONasBytes)
   if err != nil {
	   return shim.Error(err.Error())
   }
      
   // ==== Index ====
   //indexName := "manufacturer~id"
   //manufacturerIdIndexKey, err := stub.CreateCompositeKey(indexName, []string{drugPackage.Manufacturer, drugPackageId})
   //if err != nil {
   //	   return shim.Error(err.Error())
   //}
   
   // === Save index entry to state ====

   //value := []byte{0x00}
   //stub.PutState(manufacturerIdIndexKey, value)

   // ==== Index ====
   

   // ==== DrugPackage saved and indexed ====
   fmt.Println("- end init drug package")
   return shim.Success(nil)

}

// =========================================================
// readDrugPackage - read a drugPackage from chaincode state
// =========================================================
func (t *SimpleChaincode) readDrugPackage(stub shim.ChaincodeStubInterface, args []string) pb.Response {
   
   // DrugPackageId
   var drugPackageId, jsonResp string
   var err error
   
   if len(args) != 1 {
          return shim.Error("Incorrect number of arguments. Expecting package to query")
   }

   drugPackageId = args[0]
   valAsBytes, err := stub.GetState(drugPackageId) 
   if err != nil {
	   jsonResp = "{\"Error\":\"Failed to get state for " + drugPackageId + "\"}"
	   return shim.Error(jsonResp)
   } else if valAsBytes == nil {
	   jsonResp = "{\"Error\":\"Package does not exist: " + drugPackageId + "\"}"
	   return shim.Error(jsonResp)
   }

   return shim.Success(valAsBytes)
}


func (t *SimpleChaincode) queryDrugPackages(stub shim.ChaincodeStubInterface, args []string) pb.Response {
  
  if len(args) < 1 {
          return shim.Error("Incorrect number of arguments. Expecting 1")
  }

  queryString := args[0]

  queryResults, err := getQueryResultForQueryString(stub, queryString)
  if err != nil {
	  return shim.Error(err.Error())
  }
  return shim.Success(queryResults)

}


func (t *SimpleChaincode) queryDrugPackageByManufacturer(stub shim.ChaincodeStubInterface, args []string) pb.Response {
  
  // Manufacturer
  if len(args) < 1 {
	  return shim.Error("Incorrect number of arguments. Expecting 1")
  }

  manufacturer := strings.ToLower(args[0])
  queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"drugPackage\",\"manufacturer\":\"%s\"}}", manufacturer)
  
  queryResults, err := getQueryResultForQueryString(stub, queryString)
  if err != nil {
	  return shim.Error(err.Error())
  }
  return shim.Success(queryResults)

}


func (t *SimpleChaincode) queryDrugPackageByHolder(stub shim.ChaincodeStubInterface, args []string) pb.Response {

   // Holder
   if len(args) < 1 {
	   return shim.Error("Incorrect number of arguments. Expecting 1")
   }

   holder := strings.ToLower(args[0])

   queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"drugPackage\",\"holder\":\"%s\"}}", holder)

   queryResults, err := getQueryResultForQueryString(stub, queryString)
   if err != nil {
	   return shim.Error(err.Error())
   }
   return shim.Success(queryResults)

}

func (t* SimpleChaincode) queryDrugPackageByName(stub shim.ChaincodeStubInterface, args []string) pb.Response {

   // Name
   if len(args) < 1 {
	   return shim.Error("Incorrect number of arguments. Expecting 1")
   }

   name := strings.ToLower(args[0])

   queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"drugPackage\",\"name\":\"%s\"}}", name)

   queryResults, err := getQueryResultForQueryString(stub, queryString)
   if err !=nil {
	   return shim.Error(err.Error())
   }
   return shim.Success(queryResults)
}


// ==================================================================
// Transfer a drugPackage by setting a new holder name on the package
// ==================================================================
func (t *SimpleChaincode) transferDrugPackage(stub shim.ChaincodeStubInterface, args[]string) pb.Response {
        //Id, Holder, Temperature, Humidity, LocationLatitude, LocationLongitude, Pieces, Timestamp
	if len(args) < 8 {
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}

	packageId := args[0]
	newHolder := strings.ToLower(args[1])
	newTemperature, err := strconv.ParseFloat(args[2], 64)
	newTemperature = float64(newTemperature)
	if err != nil {
		return shim.Error("3rd argument must be a numeric string")
	}
        newHumidity, err := strconv.ParseFloat(args[3], 64)
	newHumidity = float64(newHumidity)
	if err != nil {
		return shim.Error("4th argument must be a numeric string")
	}
	newLocationLatitude := args[4]
	newLocationLongitude := args[5]
	pieces := args[6]

	fmt.Println("- start transferDrugPackage ", packageId, newHolder)

	drugPackageAsBytes, err := stub.GetState(packageId)
        if err != nil {
		return shim.Error("Failed to get package: " + err.Error())
	} else if drugPackageAsBytes == nil {
		return shim.Error("Package does not exist")
	}
       
	// Create new location and marshall to json
	objectType := "location"
        newLocation := location{objectType, newLocationLatitude, newLocationLongitude} 
	
	newTimestamp := args[6]

	drugPackageToTransfer := drugPackage{}
	err = json.Unmarshal(drugPackageAsBytes, &drugPackageToTransfer)

	if err != nil {
		return shim.Error(err.Error())
	}
	drugPackageToTransfer.Holder = newHolder //change the holder
	drugPackageToTransfer.Temperature = newTemperature //change the temperature
	drugPackageToTransfer.Humidity = newHumidity //change the the humidity
	drugPackageToTransfer.Location = newLocation //change the location
        drugPackageToTransfer.Timestamp = newTimestamp //change the timestamp
	drugPackageToTransfer.Pieces, err = strconv.Atoi(pieces)

	if drugPackageToTransfer.dateShipped == "0" {
		drugPackageToTransfer.dateShipped = newTimestamp
	}
	drugPackageJSONasBytes, _ := json.Marshal(drugPackageToTransfer)
	err = stub.PutState(packageId, drugPackageJSONasBytes) //rewrite the package
	if err != nil {
		return shim.Error(err.Error())
	}
        fmt.Println("- end transferDrugPackage (success)")
	return shim.Success(nil)
}

// ==================================================================
// Move a drugPackage by setting a new location name on the package
// ==================================================================
func (t *SimpleChaincode) moveDrugPackage(stub shim.ChaincodeStubInterface, args[]string) pb.Response {
	// Id, Temperature, Humidity, LocationLatitutde, LocationLongitude, Timestamp
	if len(args) < 6 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	packageId := args[0]
	newTemperature, err := strconv.ParseFloat(args[1], 64)
	newTemperature = float64(newTemperature)
	if err != nil {
		return shim.Error("2nd argument must be a numeric string")
	}
	newHumidity, err := strconv.ParseFloat(args[2], 64)
	newHumidity = float64(newHumidity)
	if err != nil {
		return shim.Error("3rd argument must be a numeric string")
	}

	newLocationLatitude := args[3]
	newLocationLongitude := args[4]

	fmt.Println("- start moveDrugPackage ", packageId)

	drugPackageAsBytes, err := stub.GetState(packageId)
        if err != nil {
		return shim.Error("Failed to get package: " + err.Error())
	} else if drugPackageAsBytes == nil {
		return shim.Error("Package does not exist")
	}
       
	// Create new location and marshall to json
	objectType := "location"
        newLocation := location{objectType, newLocationLatitude, newLocationLongitude} 
	
	newTimestamp := args[4]

	drugPackageToMove := drugPackage{}
	err = json.Unmarshal(drugPackageAsBytes, &drugPackageToMove)

	if err != nil {
		return shim.Error(err.Error())
	}
	drugPackageToMove.Temperature = newTemperature //change the temperature
	drugPackageToMove.Humidity = newHumidity //change the humidity
	drugPackageToMove.Location = newLocation //change the location
        drugPackageToMove.Timestamp = newTimestamp //change the timestamp

	if drugPackageToMove.dateShipped == "0" {
		drugPackageToMove.dateShipped = newTimestamp
	}
	drugPackageJSONasBytes, _ := json.Marshal(drugPackageToMove)
	err = stub.PutState(packageId, drugPackageJSONasBytes) //rewrite the package
	if err != nil {
		return shim.Error(err.Error())
	}
        fmt.Println("- end moveDrugPackage (success)")
	return shim.Success(nil)
}


//==================================================================================
//constructQueryResponseFromIterator constructs a JSON array containing query results
//from a given results iterator
//==================================================================================

func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) (*bytes.Buffer, error) {
	//buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")
		
		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return &buffer, nil

}

func (t* SimpleChaincode) getHistoryForDrugPackage(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	packageId := args[0]
        fmt.Printf("- start getHistoryForPackage: %s\n", packageId)

	resultsIterator, err := stub.GetHistoryForKey(packageId)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the package
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
 	        response, err := resultsIterator.Next()
	        if err != nil {
		        return shim.Error(err.Error())
	        }
	        if bArrayMemberAlreadyWritten == true {
		        buffer.WriteString(",")
	        }
	        buffer.WriteString("\"TxId\":")
	        buffer.WriteString("\"")
                buffer.WriteString(response.TxId)
                buffer.WriteString("\"")
                buffer.WriteString(", \"Value\":")

	        if response.IsDelete {
		        buffer.WriteString("null")
	        } else {
	                buffer.WriteString(string(response.Value))
	        }

                buffer.WriteString(", \"Timestamp\":")
                buffer.WriteString("\"")
                buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
                buffer.WriteString("\"")

                buffer.WriteString(". \"IsDelete\":")
                buffer.WriteString("\"")
                buffer.WriteString(strconv.FormatBool(response.IsDelete))
                buffer.WriteString("\"")

                buffer.WriteString("}")
                bArrayMemberAlreadyWritten = true

        }
	buffer.WriteString("]")

        fmt.Printf("- getHistoryForPackage returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// ==================================================
// delete - remove a drug package from state
// ==================================================
func (t *SimpleChaincode) deleteDrugPackage(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var jsonResp string
	var drugPackageJSON drugPackage
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	drugPackageId := args[0]

	// to maintain the color~name index, we need to read the marble first and get its color
	valAsbytes, err := stub.GetState(drugPackageId) //get the marble from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + drugPackageId + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Marble does not exist: " + drugPackageId + "\"}"
		return shim.Error(jsonResp)
	}

	err = json.Unmarshal([]byte(valAsbytes), &drugPackageJSON)
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to decode JSON of: " + drugPackageId + "\"}"
		return shim.Error(jsonResp)
	}

	err = stub.DelState(drugPackageId) //remove the marble from chaincode state
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	return shim.Success(nil)
}


// getQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
// =========================================================================================
func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

        fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

        resultsIterator, err := stub.GetQueryResult(queryString)
        if err != nil {
                return nil, err
        }
        defer resultsIterator.Close()

        buffer, err := constructQueryResponseFromIterator(resultsIterator)
        if err != nil {
                return nil, err
        }

        fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

        return buffer.Bytes(), nil
}
