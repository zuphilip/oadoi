angular.module('app', [

    // external libs
    'ngRoute',
    'ngMessages',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngMaterial',
    'ngProgress',

    // this is how it accesses the cached templates in ti.js
    'templates.app',

    // services
    'numFormat',

    // pages
    "landing",
    "staticPages"

]);




angular.module('app').config(function ($routeProvider,
                                       $mdThemingProvider,
                                       $locationProvider) {
    $locationProvider.html5Mode(true);
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette("blue")



});


angular.module('app').run(function($route,
                                   $rootScope,
                                   $q,
                                   $timeout,
                                   $cookies,

                                   $http,
                                   $location) {

      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      ga('create', 'UA-23384030-5', 'auto');





    $rootScope.$on('$routeChangeStart', function(next, current){
    })
    $rootScope.$on('$routeChangeSuccess', function(next, current){
        //window.scrollTo(0, 0)
        ga('send', 'pageview', { page: $location.url() });

    })



    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        console.log("$routeChangeError! here's some things to look at: ", event, current, previous, rejection)

        $location.url("page-not-found")
        window.scrollTo(0, 0)
    });
});



angular.module('app').controller('AppCtrl', function(
    ngProgressFactory,
    $rootScope,
    $scope,
    $route,
    $location,
    NumFormat,
    $http,
    $mdDialog,
    $sce){

    console.log("the angular app is running")

    var progressBarInstance = ngProgressFactory.createInstance();

    $rootScope.progressbar = progressBarInstance
    $scope.progressbar = progressBarInstance
    $scope.numFormat = NumFormat
    $scope.moment = moment // this will break unless moment.js loads over network...

    $scope.global = {}

    $scope.pageTitle = function(){
        if (!$scope.global.title){
            $scope.global.title = "Discover the online impact of your research"
        }
        return "Impactstory: " + $scope.global.title
    }





    $rootScope.$on('$routeChangeSuccess', function(next, current){
        $scope.global.template = current.loadedTemplateUrl
            .replace("/", "-")
            .replace(".tpl.html", "")
        $scope.global.title = null
    })

    $scope.trustHtml = function(str){
        return $sce.trustAsHtml(str)
    }

    var showAlert = function(msgText, titleText, okText){
        if (!okText){
            okText = "ok"
        }
          $mdDialog.show(
                  $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title(titleText)
                    .textContent(msgText)
                    .ok(okText)
            );
    }
    $rootScope.showAlert = showAlert
})
















angular.module('landing', [
    'ngRoute',
    'ngMessages'
])

    .config(function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: "landing.tpl.html",
            controller: "LandingPageCtrl"
        })
    })

    .config(function ($routeProvider) {
        $routeProvider.when('/landing/:landingPageName', {
            templateUrl: "landing.tpl.html",
            controller: "LandingPageCtrl"
        })
    })

    .controller("LandingPageCtrl", function ($scope,
                                             $http,
                                             $rootScope,
                                             $timeout) {

        console.log("i am the landing page ctrl")
        $scope.main = {}


        var animate = function(step){
            $scope.animation = step + "start"
            console.log("set animation", $scope.animation)
            $timeout(function(){
                $scope.animation = step + "finish"
                console.log("set animation", $scope.animation)
            }, 350)
        }

        var baseUrl = "http://api.oadoi.org/v1/publication/doi/"
        $scope.exampleDoi = "10.1016/j.tree.2007.03.007"
        $scope.exampleDoi = "10.1038/ng.3260"

        $scope.selectExample = function(){
            $scope.main.exampleSelected = true
            $scope.main.doi = $scope.exampleDoi
        }
        $scope.tryAgain = function(){
            $scope.animation = null
            $scope.main = {}
        }



        $scope.$watch(function(s){return s.main.doi }, function(newVal, oldVal){
            console.log("doi change", newVal, oldVal)
            if (!newVal){
                return false
            }

            if (newVal.indexOf("10.") >= 0) {
                animate(1)
                $http.get(baseUrl + newVal)
                    .success(function(resp){
                        console.log("got response back", resp.results[0])
                        if (newVal.indexOf($scope.exampleDoi) >= 0){
                            console.log("this is the sample DOI...waiting to return result.")
                            $timeout(function(){
                                console.log("returning the result now")
                                animate(2)
                                $scope.main.resp = resp.results[0]
                            }, 1000)
                        }
                        else {
                            animate(2)
                            $scope.main.resp = resp.results[0]
                        }


                    })
            }
            else {
                $scope.main = {}
                $rootScope.showAlert(
                    "Sorry, you have to paste DOIs here...you can't type them."
                )
            }
        })

    })











angular.module("numFormat", [])

    .factory("NumFormat", function($location){

        var commas = function(x) { // from stackoverflow
            if (!x) {
                return x
            }
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        }


        var short = function(num, fixedAt){
            if (typeof num === "string"){
                return num  // not really a number
            }

            // from http://stackoverflow.com/a/14994860/226013
            if (num === null){
                return 0
            }
            if (num === 0){
                return 0
            }

            if (num >= 1000000) {
                return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            }
            if (num >= 100000) { // no decimal if greater than 100thou
                return (num / 1000).toFixed(0).replace(/\.0$/, '') + 'k';
            }

            if (num >= 1000) {
                return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
            }


            if (num < 1) {
                return Math.round(num * 100) / 100;  // to two decimals
            }

            return Math.ceil(num);
        }

        var round = function(num){
            return Math.round(num)
        }

        var doubleUrlEncode = function(str){
            return encodeURIComponent( encodeURIComponent(str) )
        }

        // from http://cwestblog.com/2012/09/28/javascript-number-getordinalfor/
        var ordinal = function(n) {
            n = Math.round(n)
            var s=["th","st","nd","rd"],
                v=n%100;
            return n+(s[(v-20)%10]||s[v]||s[0]);
        }

        var decimalToPerc = function(decimal, asOrdinal){
            var ret = Math.round(decimal * 100)
            if (asOrdinal){
                ret = ordinal(ret)
            }
            return ret
        }
        return {
            short: short,
            commas: commas,
            round: round,
            ordinal: ordinal,
            doubleUrlEncode: doubleUrlEncode,
            decimalToPerc: decimalToPerc

        }
    });
angular.module('staticPages', [
    'ngRoute',
    'ngMessages'
])

    .config(function ($routeProvider) {
        $routeProvider.when('/api', {
            templateUrl: "api.tpl.html",
            controller: "StaticPageCtrl"
        })
    })

    .config(function ($routeProvider) {
        $routeProvider.when('/about', {
            templateUrl: "about.tpl.html",
            controller: "StaticPageCtrl"
        })
    })

    .config(function ($routeProvider) {
        $routeProvider.when('/team', {
            templateUrl: "team.tpl.html",
            controller: "StaticPageCtrl"
        })
    })

    .controller("StaticPageCtrl", function ($scope,
                                             $http,
                                             $rootScope,
                                             $timeout) {

        console.log("static page ctrl")
        $timeout(function(){
            console.log("highlight?")
            hljs.initHighlighting();
        })

    })











angular.module('templates.app', ['about.tpl.html', 'api.tpl.html', 'landing.tpl.html', 'team.tpl.html']);

angular.module("about.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about.tpl.html",
    "<div class=\"page about\">\n" +
    "    <h1>About</h1>\n" +
    "        oaDOI is an alternative DOI resolver that gets free fulltext where available,\n" +
    "            instead of just an article landing page.\n" +
    "        <ul>\n" +
    "            <li>DOI gets you a paywall page: <a href=\"http://doi.org/10.1038/ng.3260\"><span>doi.org</span>/10.1038/ng.3260</a></li>\n" +
    "            <li>oaDOI gets you a PDF: <a href=\"http://oadoi.org/10.1038/ng.3260\"><span>oadoi.org</span>/10.1038/ng.3260</a></li>\n" +
    "        </ul>\n" +
    "\n" +
    "    <h2>Data Sources</h2>\n" +
    "    <div>\n" +
    "        We look for open copies of articles using the following data sources:\n" +
    "        <ul>\n" +
    "            <li>The <a href=\"https://doaj.org/\">Directory of Open Access Journals</a> to see if it’s in their index of OA journals.</li>\n" +
    "            <li><a href=\"http://crossref.org/\">CrossRef’s</a> license metadata field, to see if the publisher has reported an open license.</li>\n" +
    "            <li>Our own custom list DOI prefixes, to see if it's in a known preprint repository.</li>\n" +
    "            <li><a href=\"http://datacite.org/\">DataCite</a>, to see if it’s an open dataset.</li>\n" +
    "            <li>The wonderful <a href=\"https://www.base-search.net/\">BASE OA search engine</a> to see if there’s a Green OA copy of the article.\n" +
    "            BASE indexes 90mil+ open documents in 4000+ repositories by harvesting OAI-PMH metadata.</li>\n" +
    "            <li>Repository pages directly, in cases where BASE was unable to determine openness.</li>\n" +
    "            <li>Journal article pages directly, to see if there’s a free PDF link (this is great for detecting hybrid OA)</li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <h2>More details coming soon</h2>\n" +
    "    <div>\n" +
    "        We're launching oaDOI during #OAweek2016.  Check back for more details then :)\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("api.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("api.tpl.html",
    "<div class=\"page api\">\n" +
    "    <h1>API</h1>\n" +
    "    <p>\n" +
    "        The REST API allows programmatic access to read oaDOI's data. It's free and open for anyone to use.\n" +
    "        Just please send <code>?email=YOUREMAIL</code> in your reqeusts so we can get in touch if something\n" +
    "        breaks, and so we can report usage to our funders :). The rate limit is 10k requests per day, but\n" +
    "        get in touch if you need more and we'll hook you up.\n" +
    "    </p>\n" +
    "\n" +
    "\n" +
    "    <h2>Endpoints</h2>\n" +
    "\n" +
    "\n" +
    "    <div class=\"endpoint\">\n" +
    "        <h3>GET /v1/publication/doi/:doi</h3>\n" +
    "        <p>\n" +
    "            This is handy for testing because you can run it in\n" +
    "            your browser. Here's an example:\n" +
    "        </p>\n" +
    "        <pre class=\"smallen\"><code class=\"html\"><a href=\"http://api.oadoi.org/v1/publication/doi/10.1038/ng.3260?email=me@example.com\">http://api.oadoi.org/v1/publication/doi/10.1038/ng.3260?email=YOUREMAIL</a></code></pre>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"endpoint\">\n" +
    "        <h3>POST /v1/publications</h3>\n" +
    "\n" +
    "        <div>\n" +
    "            This is probably the endpoint you want, since you can query up to 25 DOIs at a time this way.\n" +
    "            That helps you stay inside your rate limit, gets much faster results,\n" +
    "            and helps us make fewer requests to our data sources.\n" +
    "        </div>\n" +
    "        <pre class=\"wrap\">\n" +
    "            <code>\n" +
    "curl -X POST -H \"Accept: application/json\" -H \"Content-Type: application/json\" -d '{\"dois\": [\"10.1038/ng.3260\", \"10.1371/journal.pone.0000308\"]}' \"http://api.oadoi.org/v1/publications\"\n" +
    "            </code>\n" +
    "        </pre>\n" +
    "    </div>\n" +
    "\n" +
    "    <h2>Return format</h2>\n" +
    "    <div>\n" +
    "        Here's an example of what you get back. We'll be adding more documentation on on these\n" +
    "        fields soon.\n" +
    "    </div>\n" +
    "    <pre><code class=\"json\">{\n" +
    "    doi: \"10.1038/ng.3260\",\n" +
    "    doi_resolver: \"crossref\",\n" +
    "    evidence: \"scraping of oa repository (via base-search.net oa url)\",\n" +
    "    free_fulltext_url: \"https://dash.harvard.edu/bitstream/handle/1/25290367/mallet%202015%20polytes%20commentary.preprint.pdf?sequence=1\",\n" +
    "    is_boai_license: false,\n" +
    "    is_free_to_read: true,\n" +
    "    is_subscription_journal: true,\n" +
    "    license: \"cc-by-nc\",\n" +
    "    oa_color: \"green\",\n" +
    "    url: \"http://doi.org/10.1038/ng.3260\"\n" +
    "}</code></pre>\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("landing.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("landing.tpl.html",
    "<div class=\"top-screen\" layout=\"row\" layout-align=\"center center\">\n" +
    "    <div class=\"content\">\n" +
    "\n" +
    "        <div class=\"enter-doi no-doi demo-step\"\n" +
    "             ng-class=\"{'animated fadeOutDown': animation=='2start'}\"\n" +
    "             ng-hide=\"animation=='2start' || animation=='2finish'\">\n" +
    "\n" +
    "            <h1 class=\"animation-{{ !!animation }} site-heading\">\n" +
    "                <img src=\"static/img/oadoi-logo.png\" alt=\"\" class=\"logo\">\n" +
    "                Leap over tall paywalls in a single bound.\n" +
    "\n" +
    "                <!--\n" +
    "                Link to the open version of any DOI\n" +
    "\n" +
    "                -->\n" +
    "\n" +
    "\n" +
    "                <!--\n" +
    "                Use oadoi.org/your_doi\n" +
    "                to find the Open Access version\n" +
    "                -->\n" +
    "            </h1>\n" +
    "\n" +
    "            <div class=\"under\">\n" +
    "                <div class=\"input-row\">\n" +
    "                    <md-input-container md-no-float class=\"md-block example-selected-{{ main.exampleSelected }}\" flex-gt-sm=\"\">\n" +
    "                        <!--\n" +
    "                        <label ng-show=\"!animation\" class=\"animating-{{ animation }}\" >Paste your DOI here</label>\n" +
    "                        -->\n" +
    "\n" +
    "                        <div class=\"us\"  >oadoi.org/</div>\n" +
    "                        <input ng-model=\"main.doi\"\n" +
    "                               ng-disabled=\"animation\">\n" +
    "                        <md-progress-circular md-diameter=\"26px\"></md-progress-circular>\n" +
    "\n" +
    "                    </md-input-container>\n" +
    "\n" +
    "                </div>\n" +
    "                <div class=\"text\">\n" +
    "                    <div class=\"example-doi\"\n" +
    "                         ng-class=\"{'animated fadeOut': animation}\"\n" +
    "                         ng-hide=\"animation\">\n" +
    "                        <span class=\"label\">Paste in a DOI, or try this example: </span>\n" +
    "                        <span class=\"val\" ng-click=\"selectExample()\">http://doi.org/{{ exampleDoi }}</span>\n" +
    "                        <a href=\"http://doi.org/{{ exampleDoi }}\" target=\"_blank\">[paywall]</a>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <div class=\"has-results demo-step\"\n" +
    "             ng-class=\"{'animated fadeInDown': animation==='2finish'}\"\n" +
    "             ng-show=\"animation && animation==='2finish'\">\n" +
    "\n" +
    "\n" +
    "            <h1 ng-show=\"main.resp.is_free_to_read\"><i class=\"fa fa-check\"></i> Success!</h1>\n" +
    "            <h1 ng-show=\"!main.resp.is_free_to_read\"><i class=\"fa fa-times\"></i> No dice</h1>\n" +
    "\n" +
    "            <div class=\"result-url\">\n" +
    "                <span class=\"label\">Direct link: </span>\n" +
    "                <a class=\"main\" href=\"http://oadoi.org/{{ main.resp.doi }}\" target=\"_blank\">\n" +
    "                    <i class=\"fa fa-unlock\" ng-show=\"main.resp.free_fulltext_url\"></i>\n" +
    "                    <i class=\"fa fa-lock\" ng-show=\"!main.resp.free_fulltext_url\"></i>\n" +
    "                    <span class=\"us\">oadoi.org/</span><span class=\"doi\">{{ main.resp.doi }}</span>\n" +
    "                    <i class=\"fa fa-external-link\"></i>\n" +
    "                </a>\n" +
    "\n" +
    "                <a class=\"mobile-help\" href=\"http://oadoi.org/{{ main.resp.doi }}\" target=\"_blank\"><i class=\"fa fa-external-link\"></i> click to view</a>\n" +
    "\n" +
    "                <a class=\"api\" href=\"http://api.oadoi.org/v1/publication/doi/{{ main.resp.doi }}\" class=\"api-url\" target=\"_blank\">\n" +
    "                    <i class=\"fa fa-cogs\"></i>\n" +
    "                    View this result in the API\n" +
    "                </a>\n" +
    "\n" +
    "            </div>\n" +
    "            <div class=\"result-explanation\">\n" +
    "                <span class=\"hybrid success result\"\n" +
    "                      ng-show=\"main.resp.is_subscription_journal && main.resp.oa_color=='gold'\">\n" +
    "                    This article is openly available as Hybrid OA in a subscription journal,\n" +
    "                </span>\n" +
    "\n" +
    "                <span class=\"gold journal success result\"\n" +
    "                      ng-show=\"main.resp.oa_color=='gold' && !main.resp.is_subscription_journal && main.resp.doi_resolver == 'crossref'\">\n" +
    "                    This article is openly available in a <span class=\"gold-oa\">Gold OA</span> journal,\n" +
    "                </span>\n" +
    "\n" +
    "                <span class=\"gold repo success result\"\n" +
    "                      ng-show=\"main.resp.oa_color=='gold' && main.resp.doi_resolver == 'datacite'\">\n" +
    "                    This article is openly available in a <span class=\"gold-oa\">Gold OA</span> repository,\n" +
    "                </span>\n" +
    "\n" +
    "\n" +
    "                <span class=\"green success result\"\n" +
    "                      ng-show=\"main.resp.oa_color=='green'\">\n" +
    "                    This article was\n" +
    "                    <a href=\"{{ main.resp.url }}\">published behind a paywall,</a>\n" +
    "                    but we found a Green OA copy that’s\n" +
    "                    free to read<span ng-show=\"main.resp.is_boai_license\" class=\"full-oa\"> and reuse</span>,\n" +
    "                </span>\n" +
    "\n" +
    "\n" +
    "                <span class=\"not-oa failure result\" ng-show=\"!main.resp.free_fulltext_url\">\n" +
    "                    Sorry, this article is behind a paywall, and we couldn’t find a free copy anywhere.\n" +
    "                    Unfortunately, this is still true\n" +
    "                    <a href=\"https://arxiv.org/abs/1206.3664\">for around 80% of scholarly articles.</a>\n" +
    "                </span>\n" +
    "\n" +
    "                <span class=\"license-info\" ng-show=\"main.resp.is_free_to_read\">\n" +
    "                    <span class=\"license not-specified\" ng-show=\"!main.resp.license\">\n" +
    "                        with no license specified.\n" +
    "                    </span>\n" +
    "                    <span class=\"license partly-open\" ng-show=\"main.resp.license && !main.resp.is_boai_license\">\n" +
    "                        under a\n" +
    "                        <a href=\"http://sparcopen.org/our-work/howopenisit/\"><span>{{ main.resp.license }}</span> license.</a>\n" +
    "                    </span>\n" +
    "                    <span class=\"license fully-open\" ng-show=\"main.resp.license && main.resp.is_boai_license\">\n" +
    "                        under a\n" +
    "                        <a href=\"http://sparcopen.org/our-work/howopenisit/\">fully open license <span>({{ main.resp.license }}).</span></a>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "            <div class=\"results-options\">\n" +
    "                <a class=\"primary\" href=\"about\"><i class=\"fa fa-info-circle\"></i> learn more</a>\n" +
    "                <a class=\"secondary\"  href=\"\" ng-click=\"tryAgain()\"><i class=\"fa fa-undo\"></i> try another</a>\n" +
    "                <a href=\"https://twitter.com/intent/tweet?url=http://oadoi.org/&text=Check out @oaDOI_org, an alternative DOI resolver that gets %23openaccess versions of paywalled articles. %23oaWeek2016\"\n" +
    "                   target=\"_blank\"\n" +
    "                   class=\"share twitter\">\n" +
    "                    <i class=\"fa fa-twitter\"></i>\n" +
    "                    <span class=\"text\">share</span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <!--\n" +
    "    <div class=\"more\" ng-show=\"!animation || animation=='2finish'\">\n" +
    "        <i class=\"fa fa-chevron-down\"></i>\n" +
    "        Learn more\n" +
    "    </div>\n" +
    "    -->\n" +
    "</div>");
}]);

angular.module("team.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("team.tpl.html",
    "<div class=\"page team\">\n" +
    "    <h1>Team</h1>\n" +
    "    <p>\n" +
    "        oaDOI is being built at <a href=\"http://impactstory.org\">Impactstory</a>\n" +
    "        by <a href=\"http://twitter.com/researchremix\">Heather Piwowar<a/> and\n" +
    "        <a href=\"http://twitter.com/jasonpriem\">Jason Priem</a>, funded by the Alfred P. Sloan foundation.\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        We'd like to thank all of the people who've worked on earlier projects\n" +
    "        (<a href=\"http://ananelson.github.io/oacensus/\">OA Census</a>,\n" +
    "        <a href=\"https://github.com/CottageLabs/OpenArticleGauge\">Open Article Gauge</a>,\n" +
    "        <a href=\"http://dissem.in/\">Dissemin</a>,\n" +
    "        <a href=\"https://cottagelabs.com/ \">Cottage Labs</a>, and the\n" +
    "        <a href=\"https://openaccessbutton.org/\">Open Access Button</a>)\n" +
    "        for sharing ideas in conversations and open source code -- in particular <a href=\"http://doai.io/\">DOAI</a>\n" +
    "        for inspiring the DOI resolver part of this project.  Thanks also to <a href=\"/about\"> the\n" +
    "        data sources</a> that make oaDOI possible.\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        All of the code behind oaDOI is <a href=\"http://github.com/impactstory/oadoi\">open source on GitHub</a>.\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        Questions or ideas?  You can reach us at <a href=\"mailto:team@impactstory.org\">team@impactstory.org</a>\n" +
    "        or <a href=\"http://twitter.com/oadoi_org\">@oadoi_org</a>.\n" +
    "    </p>\n" +
    "</div>\n" +
    "");
}]);
