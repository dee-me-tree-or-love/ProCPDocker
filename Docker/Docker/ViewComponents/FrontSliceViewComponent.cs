using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.DAL;
using Docker.Models;
using Microsoft.AspNetCore.Mvc;

namespace Docker.ViewComponents
{
    [Route("Front")]
    public class FrontSliceViewComponent : ViewComponent
    {

        public async Task<IViewComponentResult> InvokeAsync(int y)
        {
            ContainerCollection cc = DBInitializer.
            Container[,] slice = new Container[cc.X, cc.Z];

            foreach (Container ccContainer in cc.Containers)
            {
                int tempX = ccContainer.X;
                int tempY = ccContainer.Y;
                int tempZ = ccContainer.Z;
                if (tempY == y)
                {
                    slice[tempX, tempZ] = ccContainer;
                }
            }

            return View(slice);
        }
    }
}
