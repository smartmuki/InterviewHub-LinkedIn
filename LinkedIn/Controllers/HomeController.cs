using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace LinkedIn.Controllers
{
    using System.Net.Http.Headers;
    using System.Threading.Tasks;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;

    public class HomeController : Controller
    {
        private static readonly HttpClient client = new HttpClient();

        public async Task<ActionResult> Index(string code = null)
        {
            if (code != null)
            {
                var values = new Dictionary<string, string>
                {
                    {"grant_type", "authorization_code"},
                    {"code", code},
                    {"redirect_uri", "http://localhost:37792"},
                    {"client_id", "81ufgqsbif2zx5"},
                    {"client_secret", "xiklDKYAuPTxCDyS"}
                };

                var content = new FormUrlEncodedContent(values);

                var response = await client.PostAsync("https://www.linkedin.com/oauth/v2/accessToken", content);
                var responseString = await response.Content.ReadAsStringAsync();
                dynamic responseInJson = JObject.Parse(responseString);
                var accessToken = responseInJson.access_token.ToString();

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                var profileData =
                    await
                        client.GetAsync(
                            "https://api.linkedin.com/v1/people/~:(id,firstName,lastName,headline,num-connections,picture-url)?format=json");
                responseString = await profileData.Content.ReadAsStringAsync();
                responseInJson = JObject.Parse(responseString);
                ViewBag.firstName = responseInJson.firstName;
                ViewBag.lastName = responseInJson.lastName;
                ViewBag.headline = responseInJson.headline;
                ViewBag.pictureUrl = responseInJson.pictureUrl;
                ViewBag.name = responseInJson.firstName + " " + responseInJson.lastName;
            }
            else
            {
                return
                    Redirect(
                        "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=81ufgqsbif2zx5&redirect_uri=http%3A%2F%2Flocalhost%3A37792&state=DCEeFWf45A53sdfKef424&scope=r_basicprofile");
            }

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}