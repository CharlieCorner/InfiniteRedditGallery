IRG = (function(){

    var oWookmark = undefined;
    var oWookmarkOptions = {
        offset: 5, // Optional, the distance between grid items
        itemWidth: 210 // Optional, the width of a grid item
    };

    var sAfter = "";
    var sSubredditsInGallery = "";
    var isLoading = false;

    function applyLayout() {
        imagesLoaded("#pictures-container", function(){
            if (oWookmark === undefined) {
                oWookmark = new Wookmark("#pictures-container", oWookmarkOptions);
            } else {
                oWookmark.initItems();
                oWookmark.layout(true);
            }
        });
    };

    var resetParameters = function(){
        sAfter = "";
        sSubredditsInGallery = "";
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

    function buildRedditURL(){
        var url = "https://www.reddit.com/r/" + sSubredditsInGallery + ".json?";
        url += (sAfter ? "after=" + sAfter + "&" : "");
        url += "jsonp=?";
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

        if(sSubreddits){
            sSubredditsInGallery = sSubreddits;
        }
        
        var onSuccess = function foo(oData){
              var $picsContainer = $("#pictures-container");
              console.debug(oData);
              oData.data.children = filterRedditData(oData.data.children);
              sAfter = oData.data.after;

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

        isLoading = true;

        $.getJSON(
            buildRedditURL())
            .done(onSuccess)
            .fail(onFail)
            .always(function() { 
                isLoading = false;
                console.log("Call to Reddit completed!");
            });
    };

    var onScrollLogic = function(event){
      
        // Only check when we're not still waiting for data or there are images already loaded
        var isPicturesContainerEmpty = $("#pictures-container").html().trim() ? false : true;
        if(!isLoading && !isPicturesContainerEmpty) {
            // Check if we're within 100 pixels of the bottom edge of the broser window.
            var isCloseToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 5);
            if (isCloseToBottom) {
                getDataFromReddit();
            }
        }  
    };

    return{
        sayHi: sayHi,
        getDataFromReddit: getDataFromReddit,
        validateForm: validateForm,
        debughasValidDomain: hasValidDomain,
        resetGallery: resetParameters,
        onScrollLogic: onScrollLogic
    }
})();

IRG.event = (function(){

    var onSubmitRedditForm = function(){
        var $errorContainer = $("#error-container");
        $errorContainer.html("");

        var sformErrors = IRG.validateForm();

        if(!sformErrors){
            IRG.resetGallery();
            var sSubredditsEntered = $("#subreddit-input").val();
            $("#pictures-container").html("");
            console.debug(sSubredditsEntered);
            IRG.getDataFromReddit(sSubredditsEntered);

        } else {
            $errorContainer.html(sformErrors);
        }
    };

    var attachEvents = function(){
        $(window).scroll(IRG.onScrollLogic);
    };

    return {
        attachEvents: attachEvents,
        onSubmitRedditForm: onSubmitRedditForm
    }
})();