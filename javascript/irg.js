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
        console.debug(aRedditListingChildren);
        $.each(
            aRedditListingChildren,
            function (iIndex, oPost) {
              
              if(hasValidDomain(oPost.data.domain) && IRG.util.isValidURL(oPost.data.thumbnail)){
                  aFilteredChildren.push(oPost);
              }
            }
        );
        return aFilteredChildren;
    }

    function buildImageTag(oRedditPost){
        var $liTag = $(document.createElement("li"));
        
        console.debug(oRedditPost);

        var img = new Image();
        img.src = oRedditPost.data.thumbnail;
        img.alt =  oRedditPost.data.title;
        img.title =  oRedditPost.data.title;
        img.height = Math.round(img.height/img.width*200);
        img.width = 200;

        $liTag.append(img);

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
              console.debug(oData);
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

    var isValidURL = function(str) {
      var pattern = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/; // fragment locater

      return pattern.test(str);
    }

    return{
        isValidURL: isValidURL
    }
})();