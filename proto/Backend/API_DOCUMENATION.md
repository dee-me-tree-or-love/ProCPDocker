
# Simulation
 <!--- DONE: add method to get storages and ships and docks of the simulation like `.../docks/all` or something-->
 <!--  added   -->
## /new-simulation ![](check.png)
  <!-- are you sure we should callback with ok when verified only?
      if we make the client wait for all the tasks created, 
      we might escape the case when client requests tasks that are not yet created
      but I don't think it should be a big problem -->
  #### METHOD: PUT  
  #### DESCRIPTION   
  To create new simulations (pass the harbor_config -> validation -> resource creation -> task generation and saving)
  #### PARAMS 
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
  #### RETURNS: 201 CREATED  
  If the validation passes
  ```
  {
    "simulation_id":"",
    "timeline_id":"",
    "configuration_id":""
  }
  ```
  #### RETURNS 400 BAD REQUEST 
  ```
  {
    "message":"",
    "errors":[
      {
        "message":""
      }
    ]
  }
  ```

## /simulation/{simulation_id} ![](check.png)
  #### METHOD: GET
  #### DESCRIPTION 
  To get general information about a specific simulation
  <!--TODO: should be ignored, so no scope message body in this method -->
  #### PARAMS  
  Scope is what information you want to get in response, all attributes give arrays with ids or count
  <!--Yes. In other words, any HTTP request message is allowed to contain a message body, and thus must parse messages with that in mind. Server semantics for GET, however, are restricted such that a body, if any, has no semantic meaning to the request. The requirements on parsing are separate from the requirements on method semantics.
  http://stackoverflow.com/questions/978061/http-get-with-request-body-->
  ```
  {
    "scope":[""]    /* ships, docks, storages, container_count, timelines */
  }
  ```
  #### RETURNS 200 OK
  ```
  {
    "id":"",
    "date_created":"",
    "current_time":0,    /* pointer where the database is */
    "current_timeline_id":"",
    "scope":{
      ...
    }
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  ```
  {
    "message":""
  }
  ```
    
  ## /simulation/{simulation_id}/configuration ![](check.png)
  Use the url from the new simulation to download the configuration
  #### METHOD: GET  
  #### DESCRIPTION 
  To see a description of the simulation configuration
  #### PARAMS
  #### RETURNS 200 OK  
  Check params of /new-simulation
  #### RETURNS 404 RESOURCE NOT FOUND
  ```
  {
    "message":""
  }
  ```
  ## /simulation/{simulation_id}/timelines
  #### METHOD: GET
  #### DESCRIPTION  
  Retrieve the timelines of the simulation
  #### PARAMS
  #### RETURNS 200 OK
  ```
  {
    "timelines": [
      {
        "id":"",
        "time_created":"",
        "time_zero":0,
        "parent_timeline_id":"",
      }
    ]
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  ```
  {
    "message":""
  }
  ```
<!-- TODO: Are we sure that we need it? -->
## /simulation/{simulation_id}/timelines/{timeline_id}
  #### METHOD: GET
  #### DESCRIPTION  
  Retrieve the timeline of the simulation with the given ID
  #### PARAMS
  #### RETURNS 200 OK
  ```
  {
    "timeline": {
        "id":"",
        "time_created":"",
        "time_zero":"",
        "parent_timeline_id":"",
    }
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  ```
  {
    "message":""
  }
  ```
<!-- TODO: maybe also /{ ...| complete }/all to retrieve everything at once? -->
<!-- TODO: maybe without }/timelines/{ part? -->
## /simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
  #### METHOD: GET
  #### DESCRIPTION  
  Retrieve the timeline of the simulation with the given ID
  #### PARAMS
  #### RETURNS 200 OK 
  When requested storages
  ```
  {
    "storages":[
        {
              /* see response of /storage/... */
        }
      ]
  }
  ```
  #### RETURNS 200 OK 
  When requested docks
  ```
  {
    "docks":[
        {
              /* see response of /dock/... */
        }
      ]
  }
  ```
  #### RETURNS 200 OK 
  When requested ships
  ```
  {
    "storages":[
        {
              /* see response of /ship/... */
        }
      ]
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  ```
  {
    "message":""
  }
  ```

<!-- Separator -->
<!-- not nice to use the path variables for such request?  -->
# Sync
## /sync/ ![](check.png)
  #### METHOD: PATCH
  #### DESCRIPTION  
  To sync the database to a specific timestamp (roll-back/forward)
  #### PARAMS  
  ```
  {
    "simulation_id":"",
    "timeline_id":"",
    "time_stamp":0,
    "return_tasks":true /* optional - deafults to false */
  }
  ```
  #### RETURNS 200 OK 
  ```
  {
    "acknowledged":0    /* the new time pointer in the DB */
    "tasks":[]          /* see definition in /tasks */
  }
  ```
  #### RETURNS 400 BAD REQUEST 
  ```
  {
    "message":"",
    "errors":[
      {
        "message":""
      }
    ]
  }
  ```


<!-- Separator -->

# Tasks
## /tasks/{simulation_id}/{timeline_id} ![](check.png)
  #### METHOD: GET
  ..../tasks/{simulation_id}/{timeline_id}?limit=10&time_stamp=1231231
  #### DESCRIPTION  
  To get tasks with contained events
  <!-- params are not appreciated in GET method according to some sources, I dunno.. -->
 
  #### PARAMS 
  ```
  {
    "limit":10,          /* optional - deafults to 10 */
    "time_stamp":0      /* optional  - deafults to 0 */
  }
  ```
   <!-- should we maybe return the simulation id and the timeline id ? -->
  #### RETURNS 200 OK
  ```
  {
    "tasks":[
      {
        "id":"ffgsdf121dr123esd234s",
        "type":"",                      /* TODO: Think of types */
        "extra":{
            
        },
        "description":"",
        "status":"",
        "time_to_complete":0,
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
    "next_time_stamp":0
  }
  ```
  #### RETURNS 400 BAD REQUEST 
  ```
  {
    "message":"",
    "errors":[
      {
        "message":""
      }
    ]
  }
  ```
  #### RETURNS 413 PAYLOAD TOO LARGE  
  If you exceed the maximum limit of 60


<!-- Separator -->

# Storage
## /storage/{simulation_id}/{timeline_id}/{storage_id} ![](check.png)
  #### METHOD: GET
  #### DESCRIPTION  
  To get the storage with general information and references to other related harbor locations.
  #### PARAMS
  #### RETURNS 200 OK  
  ```
  {
    {
      "id":"",
      "size":{
        "x":0,
        "y":0,
        "z":0,
      },
      "containers_max":0,
      "containers_current":0,
      "connections":[
        {
          "id":"",
          "weight":0
        }
      ],
      "status":""            /* TODO: think of different option what can happen */
    }
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  If the parameters: either simulation, timeline or storage, are not found.
  ```
  {
    "message":""
  }
  ```
## /storage/{simulation_id}/{timeline_id}/{storage_id}/containers
  #### METHOD: GET
  #### DESCRIPTION
  Get the list of containers located in the storage
  #### PARAMS
  ```
  /* TODO: consider pagination */
  ```
  #### RETURNS 200 OK
  ```
  {
    "id":"",
    "containers":[
      {
        "id":"",
        "descritpion":"",
        "address":{
          "location_id":"",      /* TODO: change later? */
          "x":0,
          "y":0,
          "z":0
        },
        "weight":0,
        "cargo_type":"",        /* TODO: think of types */  
      }
    ]
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  If the parameters: either simulation, timeline or storage, are not found.
  ```
  {
    "message":""
  }
  ```

  - TODO: think of the possible PATCH methods

<!-- Separator -->

# Container
## /container/{simulation_id}/{timeline_id}/{container_id}
  #### METHOD: GET
  #### DESCRIPTION  
  Get the information about the container with the specified ID
  #### PARAMS  
  #### RETURNS 200 OK
  ```
  {
    "id":"",
    "descritpion":"",
    "address":{
      "location_id":"",      /* TODO: change later? */
      "x":0,
      "y":0,
      "z":0
    },
    "weight":0,
    "cargo_type":""        /* TODO: think of types */  
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  If the parameters: either simulation, timeline or storage, are not found.
  ```
  {
    "message":""
  }
  ```

<!-- Separator -->

# Dock
## /dock/{simulation_id}/{timeline_id}/{dock_id}
  #### METHOD: GET
  #### DESCRIPTION  
  Get the description about the dock with the specified ID
  #### PARAMS
  #### RETURNS 200 OK
  ```
  {
    "id":"",
    "loaders_count":0,
    "connected_storages":[
      {
        "id":"",
        "weight":0
      }
    ],
    "container_count":0,
    "connected_ship_id":"",
    "scheduled_ships":[
      {
        "id":"",
        "time_arrived":0
      }
    ]
  }
  ```
  <!-- changed arrival time to time arrived -->

## /dock/{simulation_id}/{timeline_id}/{dock_id}/containers
  #### METHOD: GET
  #### DESCRIPTION
  Get the list of containers located in the dock
  #### PARAMS
  ```
  /* TODO: consider pagination */
  ```
  #### RETURNS 200 OK
  ```
  {
    "containers":[
      {
        "id",
        "descritpion",
        "address":{
          "location_id":"",      /* TODO: change later? */
          "x":-1,
          "y":-1,
          "z":-1                 /* since the dock's loading zone by definition is infinite and work on pure magic */ 
        },
        "weight":0,
        "cargo_type":"",         /* TODO: think of types */  
      }
    ]
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  If the parameters: either simulation, timeline or storage, are not found.
  ```
  {
    "message":""
  }
  ```
  - TODO: think of the possible PATCH methods


<!-- Separator -->

# Ship
## /ship/{simulation_id}/{timeline_id}/{ship_id}
  #### METHOD: GET
  #### DESCRIPTION  
  To get the list of ships with general information
  #### PARAMS
  #### RETURNS 200 OK  
  ```
  {
    "id":"",
    "size":{
      "x":0,
      "y":0,
      "z":0,
    },
    "containers_max":0,
    "containers_current":0,
    "containers_unload":0,
    "containers_load":0,
    "destination":{
        "id":"",                    
        "estimated_arrival_time":0
    },
   
  }
  ```
  <!-- was abandoned due to uselessness -->
  <!-- "status":""            /* TODO: think of different option what can happen */-->
## /ship/{simulation_id}/{timeline_id}/{storage_id}/containers/all
  - TODO: think if we need that or not and in what way...
  #### METHOD: GET
  #### DESCRIPTION
  Get the list of containers associated on the ship: onboard, requested to be load from the harbor and the ones to unload
  #### PARAMS
  ```
  /* TODO: consider pagination */
  ```
  #### RETURNS 200 OK
  ```
  {
    "ship_id":"",
    "containers_onboard":[
      {
        "id",
        "descritpion",
        "address":{
          "location_id":"",      /* TODO: change later? */
          "x":0,
          "y":0,
          "z":0
        },
        "weight":0,
        "cargo_type":"",        /* TODO: think of types */  
      }
    ],
    "containers_load":[
      {
        "id",
        "descritpion",
        "address":{
          "location_id":"",      /* TODO: change later? */
          "x":0,
          "y":0,
          "z":0
        },
        "weight":0,
        "cargo_type":"",        /* TODO: think of types */  
      }
    ]
    "containers_unload":[
      {
        "id",
        "descritpion",
        "address":{
          "location_id":"",      /* TODO: change later? */
          "x":0,
          "y":0,
          "z":0
        },
        "weight":0,
        "cargo_type":"",        /* TODO: think of types */  
      }
    ]
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  If the parameters: either simulation, timeline or storage, are not found.
  ```
  {
    "message":""
  }
  ```
## /ship/{simulation_id}/{timeline_id}/{ship_id}/containers/{ onboard | load | unload }
  #### METHOD: GET
  #### DESCRIPTION
  Get the list of containers related to the ship as either : onboard, toload, tounload
  #### PARAMS
  ```
  /* TODO: consider pagination */
  ```
  #### RETURNS 200 OK
  ```
  {
    "containers":[
      {
        "id",
        "descritpion",
        "address":{
          "location_id":"",      /* TODO: change later? */
          "x":0,
          "y":0,
          "z":0
        },
        "weight":0,
        "cargo_type":"",        /* TODO: think of types */  
      }
    ]
  }
  ```
  #### RETURNS 404 RESOURCE NOT FOUND
  If the parameters: either simulation, timeline or storage, are not found.
  ```
  {
    "message":""
  }
  ```






<!-- Separator -->

# Impacts <!-- not sure about the name, see comment -->
<!-- one more concern: should we commit per one impact or to get a completely new state to be commited? 
      maybe we could adopt the following approach to doing it: 
      
      1. <change> client is doing changes - they affect only the client side -> the changes are being added to the payload as he goes
      2. <add> client has finished doing changes and is ready to commit -> the changes are grouped into a single payload
      3. <commit && push> client sends the whole payload of changes to the server -> the server creates a new branch and applies changes  

      what'd you say? 

      othewise I think we'd generate a lot of overhead and branches per every change... 
-->
## /impact/options/all
  #### METHOD: GET
  #### DESCRIPTION
  Get the available actions that can be done by the user in the simulation in a format corresponding to the payload of the `/commit` method.  
  #### RETURNS 200 OK
  <!-- maybe properties could benefit from having "type":"", field specified-->
  ```
  {
    "actions":[
      {
        "name":"",
        "type":"",
        "description":"",
        "properties":[
          {
            "name":"",
            "value":""|0
          }
        ]
      }
    ]
  }
  ```
<!-- I am so unsure about this one... -->
## /impact/{simulation_id}/{timeline_id}<!--should this be added, or do we get this automatically somehow? -->/{time_stamp}/commit/
  #### METHOD: POST  
  #### DESCRIPTION  
  Sends the new *impact* to submit the changes to the harbor state: such like 
  - new ship scheduled *(adds a new ship to the simulation)*
  - ship delayed *(time of arrival differes)*
  - storage inaccessible *(blocks the storage for X time units)*
  - dock's loader broke down *(decreases the number of loaders in the dock for N time units)*
  #### PARAMS  
  ```
  {
    "actions":[
      {
        "type":"",
        "name":"",          /* optional */
        "description":"",   /* optional */
        "properties":[
          {
            "name":"",
            "value":""|0,
          }
        ]
      }
    ]
  }
  ```
  #### RETURNS 201 CREATED
  ```
  {
    "new_timeline_id":"",
    "acknowledged_timestamp":"",
    "next_time_stamp":"",
    "tasks":[                             /* At most 5 tasks */
        {
          "id":"ffgsdf121dr123esd234s",
          "type":"",                      /* TODO: Think of types */
          "extra":{},
          "description":"",
          "status":"",
          "time_to_complete":0,
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
  }
  ```
  #### RETURNS 400 BAD REQUEST
  If some parameters are incorrect and do not comply with the configuration definition
  ```
  {
    "message":""  
  }
  ```
  #### RETURNS 404 NOT FOUND
  If the specified `{simulation_id}/{timeline_id}/{time_stamp}` can not be found.
  ```
  {
    "message":""  
  }
  ```
  #### RETURNS 409 CONFLICT
  If the provided changes result in inconsistent and unsolvable simulation
  ```
  {
    "message":"",
    "errors":[""]
  }
  ```




<!-- Separator -->



<!--
details: 

/simulation +  
/timeline  +  

/storage +_?

/container +

/dock +_?  

/ship +_? 

/random-event +_?
--> 
 <!-- maybe not `RANDOM` but more like `IMPACTS` `AFFECTIONS` or `MUTATIONS` or `CHANGES`? -->
 <!-- since it's not that they are random actually? -->
<!--GET:
  - DESCRIPTION - to get general information about a specific simulation
  - PARAMS
  - RETURNS 200 OK
-->










