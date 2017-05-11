##/new-simulation
  ####METHOD: PUT
  ####DESCRIPTION 
  To create new simulations (pass the harbor_config -> validation -> resource creation -> task generation and saving)
  ####PARAMS 
  ```
  {
    "docks": [
        {
            "id": "1",
            "number_loaders": 2
        }
    ],
    "storages": [
        {
            "x": 2,
            "y": 2,
            "z": 2,
            "id": "s1",
            "filled": 40  /* % of total containers in storage*/
        }
    ],
    "ships": [
        {
            "id": "ship1",
            "eta": 6,
            "x": 1,
            "y": 3,
            "z": 3,
            "filled": 50, /* % of total containers onboard*/
            "unload": 20, /* % of total containers to unload */
            "load": 40    /* % of total containers to load */
        }
    ]
  }
  ```
  - RETURNS 201 CREATED - if the validation passes
  ```
  {
    "simulation_id":"",
    "timeline_id":"",
    "configuration_id":""
  }
  ```
  - RETURNS 400 BAD REQUEST 
  {
    "message":"",
    "errors":[
      {
        "message":""
      }
    ]
  }


/tasks/{simulation_id}/{timeline_id}
  GET:
  ..../tasks/{simulation_id}/{timeline_id}?limit=10&time_stamp=1231231
  - DESCRIPTION - to get tasks with contained events
  - PARAMS 
  {
    "limit":10,          /* optional - deafults to 10 */
    "time_stamp":0      /* optional  - deafults to 0 */
  }
  - RETURNS 200 OK
  {
    "tasks":[
      {
        "id":"ffgsdf121dr123esd234s",
        "type":"",                      /* TODO: Think of types */
        "extra":{},
        "description":"",
        "status":"",
        "time_to_complete":0
        "events":[
          {
            "id":"",
            "type":"",                  /* TODO: Think of types */
            "message":"",
            "time_stamp":0
          }
        ]
      }
    ],
    "next_time_stamp":""
  }
  - RETURNS 400 BAD REQUEST 
  {
    "message":"",
    "errors":[
      {
        "message":""
      }
    ]
  }
  - RETURNS 413 PAYLOAD TOO LARGE - if you exceed the maximum limit of 60


/sync/{simulation_id}/{timeline_id}/{time_stamp}
  PATCH:
  - DESCRIPTION - to sync the database to a specific timestamp (roll-back/forward)
  - PARAMS
  {
    "return_tasks":true /* optional - deafults to false */
  }
  - RETURNS 200 OK 
  {
    "acknowledged":0    /* the new time pointer in the DB */
    "tasks":[]          /* see definition in /tasks */
  }
  - RETURNS 400 BAD REQUEST 
  {
    "message":"",
    "errors":[
      {
        "message":""
      }
    ]
  }


/simulation/{simulation_id}
  GET:
  - DESCRIPTION - to get general information about a specific simulation
  - PARAMS - scope is what information you want to get in response, all attributes give arrays with ids or count
  {
    "scope":[""]    /* ships, docks, storages, container_count, timelines */
  }
  - RETURNS 200 OK
  {
    "date_created":"",
    "scope":{
      ...
    }
  }
  - RETURNS 404 RESOURCE NOT FOUND
  {
    "message":""
  }

  /configuration
  GET:
  - DESCRIPTION - to see a description of the simulation configuration
  - PARAMS
  - RETURNS 200 OK - check params of /new-simulation
  - RETURNS 404 RESOURCE NOT FOUND
  {
    "message":""
  }





/timeline
/storage
/container
/dock
/ship
/random-event
GET:
  - DESCRIPTION - to get general information about a specific simulation
  - PARAMS
  - RETURNS 200 OK

