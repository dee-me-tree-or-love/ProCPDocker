# ProCPDocker
## Intro  
The Docker Project is a simulation software for modelling the port management workflow. 
## Implementation  
The core programming language to be used is C#.  
The frameworks used are: ASP .Net Core and Entity Framework Core.   
## How to get started
After cloning the project, head to the project directory: Docker/Docker, where the `Docker.csproj` is located.  
Run the following command in the cmd environment to ensure that all the dependencies exist: `dotnet ef restore`
After this step, the application should be startable be debugging the Docker solution.   
### For the testing
The testing is implemented using the XUnit framework. To run the unit tests, run the `dotnet ef restore` in the Docker.Tests directory.
Then all the test should be accessible as usual.  
#### For more weird stuff, see [develop](https://github.com/dee-me-tree-or-love/ProCPDocker/tree/develop) branch :mag:
