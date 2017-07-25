using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(LinkedIn.Startup))]
namespace LinkedIn
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
