IRG = (function(){

    var oWookmark = undefined;
    var oWookmarkOptions = {
        offset: 20, // Optional, the distance between grid items
        itemWidth: 210 // Optional, the width of a grid item
    };

    var sAfter = "";
    var sSubredditsInGallery = "";
    var isLoading = false;

    function applyLayout() {
        var fadeInImages = function(){
            setTimeout(function(){
                $("li.newImage").css("opacity", 1).removeClass("newImage");
                
            });
        };
        imagesLoaded("#pictures-container", function(){
            if (oWookmark === undefined) {
                oWookmark = new Wookmark("#pictures-container", oWookmarkOptions);
                fadeInImages();
            } else {
                oWookmark.initItems();
                oWookmark.layout(true, fadeInImages);
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
            sErrorsFound = IRG.constants.messages.info.enterSubreddits;
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
        //console.debug(aRedditListingChildren);
        $.each(
            aRedditListingChildren,
            function (iIndex, oPost) {
              var isDomainValid = hasValidDomain(oPost.data.domain);
              var isValidThumbURL = IRG.util.isValidThumbnailURL(oPost.data.thumbnail);
              
              // Don't forget to check if it is not a SELF post!
              if(!oPost.data.is_self && isDomainValid && isValidThumbURL){
                  aFilteredChildren.push(oPost);
              } else {
                  console.debug("Self? " + oPost.data.is_self + " -- Domain valid? "+ isDomainValid + " " +oPost.data.domain + " -- Is valid thumbnail URL? "+ isValidThumbURL + " " + oPost.data.thumbnail);
              }
            }
        );
        return aFilteredChildren;
    }

    function buildImageTag(oRedditPost){
        var $liTag = $(document.createElement("li"));
        var $anchorTag = $(document.createElement("a"));
        var $subtitle = $(document.createElement("p"));
        // console.debug(oRedditPost);

        var img = new Image();
        img.onload = function(){
            // The width of the grid item is set to 200, so let's play with that ratio
            this.height = Math.round(this.height/this.width*200);
            this.width = 200;
        };

        img.src = oRedditPost.data.thumbnail;
        img.alt =  oRedditPost.data.title;
        img.title =  oRedditPost.data.title;
        
        $subtitle.html("By: " + oRedditPost.data.author);
        $anchorTag.attr("href", oRedditPost.data.url);
        $anchorTag.attr("target", "_blank");

        // Add a class to manipulate the animation only on new images
        $liTag.attr("class", "newImage");
        $anchorTag.append(img);
        $liTag.append($anchorTag);
        $liTag.append($subtitle);

        return $liTag;
    }

    var showErrorMessage = function(sMessage){
        $("#error-container").html(sMessage);
    };

    var getDataFromReddit = function(sSubreddits){

        showErrorMessage("");

        if(sSubreddits){
            sSubredditsInGallery = sSubreddits;
        }
        
        var onSuccess = function foo(oData){
              var $picsContainer = $("#pictures-container");
              // console.debug(oData);
              oData.data.children = filterRedditData(oData.data.children);
              sAfter = oData.data.after;

              if(oData.data.children.length == 0){
                  showErrorMessage(IRG.constants.messages.error.noImagesFound)
              }

              
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
            showErrorMessage(IRG.constants.messages.error.aProblem);
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
        onScrollLogic: onScrollLogic,
        showErrorMessage: showErrorMessage
    }
})();

IRG.event = (function(){

    var onSubmitRedditForm = function(){
        IRG.showErrorMessage("");

        var sFormErrors = IRG.validateForm();

        if(!sFormErrors){
            IRG.resetGallery();
            var sSubredditsEntered = $("#subreddit-input").val();
            $("#pictures-container").html("");
            console.debug(sSubredditsEntered);
            IRG.getDataFromReddit(sSubredditsEntered);

        } else {
            IRG.showErrorMessage(sFormErrors);
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

IRG.util = (function(){

    var isValidThumbnailURL = function(sThumbnailURL) {
      // The thumbnail may contain things other than a URL, like 'nsfw' for nsfw links if we're not logged in
            
      return (sThumbnailURL ? true : false) 
        && sThumbnailURL !== "nsfw" 
        && sThumbnailURL !== "default"
        && sThumbnailURL !== "self";
    }

    return{
        isValidThumbnailURL: isValidThumbnailURL
    }
})();