using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.Models;
using Microsoft.AspNetCore.Mvc;

namespace Docker.ViewComponents
{
    public class FrontSliceViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(ContainerCollection cc)
        {
            int x = 2;
            Container[,] slice = new Container[cc.X, cc.Z];

            foreach (Container ccContainer in cc.Containers)
            {
                int tempX = ccContainer.X;
                int tempZ = ccContainer.Z;
                if (tempX == x)
                {
                    slice[tempX, tempZ] = ccContainer;
                }
            }

            return View(slice);
        }
    }
}
