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
            String authData = null;
            if (Session["AuthData"] == null)
            {
                if (code == null)
                {
                    return
                        Redirect(
                            "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=81ufgqsbif2zx5&redirect_uri=http%3A%2F%2Finstantinterviews.azurewebsites.net&state=DCEeFWf45A53sdfKef424&scope=r_basicprofile");
                }
                else
                {
                    var values = new Dictionary<string, string>
                    {
                        {"grant_type", "authorization_code"},
                        {"code", code},
                        {"redirect_uri", "http://instantinterviews.azurewebsites.net"},
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
                    authData = await profileData.Content.ReadAsStringAsync();
                    Session["AuthData"] = authData;
                }
            }
            else
            {
                authData = Session["AuthData"].ToString();
            }

            dynamic responseInJSONFormat = JObject.Parse(authData);
            ViewBag.firstName = responseInJSONFormat.firstName;
            ViewBag.lastName = responseInJSONFormat.lastName;
            ViewBag.headline = responseInJSONFormat.headline;
            ViewBag.pictureUrl = responseInJSONFormat.pictureUrl;
            ViewBag.name = responseInJSONFormat.firstName + " " + responseInJSONFormat.lastName;

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