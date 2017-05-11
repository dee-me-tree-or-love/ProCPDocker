
# Simulation
 - TODO: add method to get storages and ships and docks of the simulation like `.../docks/all` or something
## /new-simulation  
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

## /simulation/{simulation_id}
  #### METHOD: GET
  #### DESCRIPTION 
  To get general information about a specific simulation
  #### PARAMS  
  Scope is what information you want to get in response, all attributes give arrays with ids or count
  ```
  {
    "scope":[""]    /* ships, docks, storages, container_count, timelines */
  }
  ```
  #### RETURNS 200 OK
  ```
  {
    "date_created":"",
    "current_time":"",    /* pointer where the database is */
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
    
  ## /simulation/{simulation_id}/configuration
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
      "time_zero":"",
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

# Sync
## /sync/{simulation_id}/{timeline_id}/{time_stamp}
  #### METHOD: PATCH
  #### DESCRIPTION  
  To sync the database to a specific timestamp (roll-back/forward)
  #### PARAMS  
  ```
  {
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

# Tasks
## /tasks/{simulation_id}/{timeline_id}
  #### METHOD: GET
  ..../tasks/{simulation_id}/{timeline_id}?limit=10&time_stamp=1231231
  #### DESCRIPTION  
  To get tasks with contained events
  #### PARAMS 
  ```
  {
    "limit":10,          /* optional - deafults to 10 */
    "time_stamp":0      /* optional  - deafults to 0 */
  }
  ```
  #### RETURNS 200 OK
  ```
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

# Storages
## /storage/{simulation_id}/{timeline_id}
  #### METHOD: GET
  #### DESCRIPTION  
  To get the list of storages with general information and references to other related objects
  #### PARAMS
  #### RETURNS 200 OK  
  ```
  {
    "storages":[
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
    ]
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

- TODO: think of the possible PATCH methods

# Container
## /container/{simulation_id}/{timeline_id}/{container_id}
#### METHOD: GET
#### DESCRIPTION  
Get the information about the container with the specified ID
#### PARAMS  
#### RETURNS 200 OK
```
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
      "arrival_time":0
    }
  ]
}
```
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

# Ship
## /ship/{simulation_id}/{timeline_id}
  #### METHOD: GET
  #### DESCRIPTION  
  To get the list of ships with general information
  #### PARAMS
  #### RETURNS 200 OK  
  ```
  {
    "ships":[
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
        "status":""            /* TODO: think of different option what can happen */
      }
    ]
  }
  ```
## /ship/{simulation_id}/{timeline_id}/{storage_id}/containers/all
- TODO: think if we need that or not and in what way...
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
## /ship/{simulation_id}/{timeline_id}/{storage_id}/containers/{ onboard | load | unload }
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

<!--
/simulation +  
/timeline  +  

/storage +_?

/container +

/dock +_?  

/ship +_? 

/random-event  
GET:
  - DESCRIPTION - to get general information about a specific simulation
  - PARAMS
  - RETURNS 200 OK
-->












