IRG = (function(){

    var oWookmark = undefined;
    var oWookmarkOptions = {
        offset: 5, // Optional, the distance between grid items
        itemWidth: 210 // Optional, the width of a grid item
    };

    function applyLayout() {
        if (oWookmark === undefined) {
            oWookmark = new Wookmark("#pictures-container", oWookmarkOptions);
        } else {
            oWookmark.initItems();
            oWookmark.layout(true);
        }
    };


    var sayHi = function(sMessage){
        console.log(sMessage ? sMessage : "Hello World!");
    };

    var validateForm = function(){
        var sErrorsFound;
        var sSubredditsEntered = $("#subreddit-input").val();

        if(!sSubredditsEntered){
            sErrorsFound = "Please enter your subreddits.";
        }

        return sErrorsFound;
    };

    function buildRedditURL(sSubreddits){
        var url = "http://www.reddit.com/r/" + sSubreddits + ".json?jsonp=?";
        return url;
    };

    function hasValidDomain(sDomain){
          return $.inArray(sDomain, IRG.constants.approvedDomains) > -1;
    };

    function filterRedditData(aRedditListingChildren){
        var aFilteredChildren = [];
        console.debug(aRedditListingChildren);
        $.each(
            aRedditListingChildren,
            function (iIndex, oPost) {
              
              if(hasValidDomain(oPost.data.domain)){
                  aFilteredChildren.push(oPost);
              }
            }
        );
        return aFilteredChildren;
    }

    function buildImageTag(oRedditPost){
        var sHtmlTag = "<li>";

        console.debug(oRedditPost);
        sHtmlTag += "<img src='"+ oRedditPost.data.thumbnail + "' "
            +"alt='"+ oRedditPost.data.title + "' "
            //+"width='200' height='"+ Math.round(image.height/image.width*200) + "' 
            +"width='200' height='100'" 
            +"\">";
        //sHtmlTag += '<br>' + oRedditPost.data.title;
//        sHtmlTag += '<br>' + oRedditPost.data.url;
  //      sHtmlTag += '<br>' + oRedditPost.data.permalink;
    //    sHtmlTag += '<br>' + oRedditPost.data.ups;
      //  sHtmlTag += '<br>' + oRedditPost.data.downs;
        //sHtmlTag += '<hr>';
        sHtmlTag += "</li>"
        return sHtmlTag;
    }

    var getDataFromReddit = function(sSubreddits){
        
        var onSuccess = function foo(oData){
              var $picsContainer = $("#pictures-container");
              oData.data.children = filterRedditData(oData.data.children);

              // TODO check if the filtered Data has any data at all!

              $.each(
                //oData.data.children.slice(0, 10),
                oData.data.children,
                function (iIndex, oPost) {
                  $picsContainer.append(buildImageTag(oPost));
                }
              );
              applyLayout();
            };
        var onFail = function(jqXHR, textStatus, errorThrown) {
            console.error("ERROR: " + jqXHR.status + " - " + new Error().stack, errorThrown);
            console.debug(jqXHR);
        };


        $.getJSON(
            buildRedditURL(sSubreddits))
            .done(onSuccess)
            .fail(onFail)
            .always(function() { console.log("Call to Reddit completed!"); });
    };

    return{
        sayHi: sayHi,
        getDataFromReddit: getDataFromReddit,
        validateForm: validateForm,
        debughasValidDomain: hasValidDomain
    }
})();

IRG.event = (function(){

    var onSubmitRedditForm = function(){
        var $errorContainer = $("#error-container");
        $errorContainer.html("");

        var sformErrors = IRG.validateForm();

        if(!sformErrors){
            var sSubredditsEntered = $("#subreddit-input").val();
            $("#pictures-container").html("");
            console.debug(sSubredditsEntered);
            IRG.getDataFromReddit(sSubredditsEntered);

        } else {
            $errorContainer.html(sformErrors);
        }
    };

    return {
        onSubmitRedditForm: onSubmitRedditForm
    }
})();