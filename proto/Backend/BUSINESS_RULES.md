# System rules  
## Configuration related   
### Verification   
#### Structural   
1) Data should be sent in correct json format.   
2) Data should be consistent and have all the properties      
2.a) See API documentation for the description     
2.b) the errors found will be notified to the client      
3) Every section of the configuraion should have at least one object:       
So it is at least 1 ship, 1 dock and 1 storage.   
4) The connections between the storages and docks at the moment are placed only between these two subjects and with random distances     
5) The containers are created randomly and disperesed without any concern among the harbor entities   
#### Logical  
1) Percentage of filled (and load and unload) in instances having such attribute should be in range [0:100]
2) Percentage should be a non-negative integer
3) Sizes x,y,z should be non-zero. 
4) Percentage related to the number of containers is calculated in regards to 100% = total storage: X \* Y \* Z  
4.a) to clearify: yes, percentage unload = *N* percents of *total* capacity of the ship.
##### Ships
1) Time of arrival (ETA) should be a positive integer and calculated from the time zero of the simulation  
2) In regards to percentages:   
@  
Let's denote the percentage the ship is *filled* to as *X*  
Let *Y* be the percents of the capacity corresponding to the number of the containers to be *load*ed  
Let *Z* be the percentage of the containers that will be *unloaded* from the ship  
@  
Then **0 <= *X* + *Y* - *Z* <= 100**  
#### Docks  
1) Docks have a super method to allocate containers to buffer: they store them in a horizontal stack and can be unlimited in size.
<!--Let's leave this rule as a should for now?-->
<!--2) Number of loaders correspond to the dock's processing potential -> The time that any task the dock is responsible of doing will be *T' = T / NrLoaders*-->