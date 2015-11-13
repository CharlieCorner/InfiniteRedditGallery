IRG = (function(){
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

    var buildRedditURL = function(sSubreddits){
        var url = "http://www.reddit.com/r/" + sSubreddits + ".json?jsonp=?";
        return url;
    };

    var hasValidDomain = function(sDomain){
          return $.inArray(sDomain, IRG.constants.approvedDomains) > -1;
    };

    var filterRedditData = function(aRedditListingChildren){
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

    var buildImageTag = function(oRedditPost){
        var sHtmlTag = "";

        console.debug(oRedditPost);
        sHtmlTag = "<img src=\""+ oRedditPost.data.thumbnail +"\" alt=\""+ oRedditPost.data.title +"\">";
        //sHtmlTag += '<br>' + oRedditPost.data.title;
//        sHtmlTag += '<br>' + oRedditPost.data.url;
  //      sHtmlTag += '<br>' + oRedditPost.data.permalink;
    //    sHtmlTag += '<br>' + oRedditPost.data.ups;
      //  sHtmlTag += '<br>' + oRedditPost.data.downs;
        //sHtmlTag += '<hr>';

        return sHtmlTag;
    }

    var getDataFromReddit = function(sSubreddits){
        $.getJSON(
            buildRedditURL(sSubreddits))
            .done(function foo(oData){
              var $picsContainer = $("#pictures-container");
              oData.data.children = filterRedditData(oData.data.children);

              // TODO check if the filtered Data has any data at all!

              $.each(
                //oData.data.children.slice(0, 10),
                oData.data.children.slice(0, 10),
                function (iIndex, oPost) {
                  $picsContainer.append(buildImageTag(oPost));
                }
              );
            }
          )
          .fail(function(jqXHR, textStatus, errorThrown) { console.error("ERROR: " + new Error().stack, errorThrown); })
          .always(function() { console.log("Call to Reddit completed!"); });
    };

    return{
        sayHi: sayHi,
        getDataFromReddit: getDataFromReddit,
        validateForm: validateForm
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