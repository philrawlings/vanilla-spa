using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace VanillaSpa
{
    [ApiController]
    [Route("api/app/views")]
    public class ViewsController : ControllerBase
    {
        private readonly ILogger<ViewsController> logger;
        private readonly IWebHostEnvironment environment;

        public ViewsController(ILogger<ViewsController> logger, IWebHostEnvironment environment)
        {
            this.logger = logger;
            this.environment = environment;
        }

        /// <summary>
        /// List Views
        /// </summary>
        /// <returns>All available views</returns>
        [Route("")]
        [HttpGet]
        public ActionResult<List<ViewDefinition>> Get()
        {
            List<ViewDefinition> views = new List<ViewDefinition>();
            var viewsPath = Path.Combine(environment.WebRootPath, "views");
            if (viewsPath.EndsWith(Path.DirectorySeparatorChar))
                viewsPath = viewsPath.Substring(0, viewsPath.Length - 1);

            foreach (var viewFilePath in Directory.EnumerateFiles(viewsPath, "*.*", SearchOption.AllDirectories))
            {
                var fileType = Path.GetExtension(viewFilePath).ToLower();
                if (fileType.StartsWith("."))
                    fileType = fileType.Substring(1);

                switch (fileType)
                {
                    case "htm":
                    case "html":
                        fileType = "html";
                        break;
                    case "hbs":
                        fileType = "hbs";
                        break;
                    default:
                        fileType = null;
                        break;
                }

                var view = viewFilePath.Substring(viewsPath.Length).ToLower().Replace("\\", "/");

                if (fileType != null)
                {
                    string path = null;
                    var line1 = System.IO.File.ReadLines(viewFilePath).FirstOrDefault(); // lazy loaded so doesnt read the entire file
                    if (line1 != null)
                    {
                        line1 = line1.Trim();
                        if (line1.StartsWith("<!-- Path:") && line1.EndsWith("-->"))
                        {
                            path = line1.Substring(10, line1.Length - 13).Trim();
                        }
                    }
                    if (path is null)
                    {
                        path = view;
                    }

                    views.Add(new ViewDefinition
                    {
                        Path = path,
                        Type = fileType,
                        View = view
                    });
                }
            }
            return views;
        }
    }
}
