using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.Models;
using Microsoft.AspNetCore.Mvc;

namespace Docker.ViewComponents
{
    public class SideSliceViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(ContainerCollection cc)
        {
            int x = 0;
            Container[,] slice = new Container[cc.Y, cc.Z];

            foreach (Container ccContainer in cc.Containers)
            {
                int tempX = ccContainer.X;
                int tempY = ccContainer.Y;
                int tempZ = ccContainer.Z;
                if (tempX == x)
                {
                    slice[tempY, tempZ] = ccContainer;
                }
            }

            return View(slice);
        }
    }
}
