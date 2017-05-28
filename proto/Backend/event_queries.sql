select  e.type, e.start_time as event_start, e.task_id, t.container_id, t.description, t.destination_id, t.source_id, t.start_time as task_start, t.end_time as task_end, t.type, t.status
from Events as e
join Tasks as t 
	on e.task_id = t.id;
    
-- MOVE fwd query
UPDATE Containers C 
	join Tasks T
		on C.id = T.container_id
	join Events E
		on T.id = E.task_id
SET C.container_hold = T.destination_id, T.status = "done"
	-- enter your event.task_id here: 
WHERE E.id = "88d4c33c-75f4-4df2-b0dc-5be70428a078";


-- MOVE bwd query
UPDATE Containers C 
	join Tasks T
		on C.id = T.container_id
	join Events E
		on T.id = E.task_id
SET C.container_hold = T.source_id, T.status = "executing"
	-- enter your event.task_id here: 
WHERE E.id = "88d4c33c-75f4-4df2-b0dc-5be70428a078";

-- for testing display
/*
SELECT C.id as container, C.container_hold as location, T.destination_id as destination,
	T.source_id as source, E.id as event_id, E.type as type
FROM Containers C 
	join Tasks T
		on C.id = T.container_id
	join Events E
		on T.id = E.task_id
WHERE E.type ="move";
/**/

-- DOCK fwd query == UNDOCK bwd query
UPDATE Ships S 
	join Intervals I 
		on S.container_hold = I.ship_id
	join Tasks T
		on T.interval_id = I.id
	join Events E
		on E.task_id = T.id
SET S.dock_id = T.destination_id
-- enter your event id here:
WHERE E.id = "671bdf21-24cb-4e28-8c0e-3faef613f09e";
 
 
 
-- UNDOCK fwd query == DOCK bwd query 
UPDATE Ships S 
	join Intervals I 
		on S.container_hold = I.ship_id
	join Tasks T
		on T.interval_id = I.id
	join Events E
		on E.task_id = T.id
SET S.dock_id = NULL
-- enter your event id here:
WHERE E.id = "94f41c0b-2ad7-42ad-a546-db99a741ce58";

-- for display the test results
/*  
SELECT S.container_hold, S.dock_id, E.id
FROM Ships S 
	join Intervals I 
		on S.container_hold = I.ship_id
	join Tasks T
		on T.interval_id = I.id
	join Events E
		on E.task_id = T.id
WHERE E.type = "dock";
/**/
 
-- PICK fwd query
UPDATE Tasks T 
	join Events E
		on E.task_id = T.id
SET T.status = "executing"
WHERE E.id = "7c065e07-abd6-401b-966a-a8b1f8ec2c11";

-- PICK bwd query
UPDATE Tasks T
	join Events E
		on E.task_id = T.id
SET T.status = "waiting"
WHERE E.id = "7c065e07-abd6-401b-966a-a8b1f8ec2c11";

-- for testing dispalay

SELECT T.id as task, T.status as status, E.id as event, E.type as type
FROM Tasks T
	join Events E
		on E.task_id = T.id
WHERE E.type = "pick";
/**/
 
