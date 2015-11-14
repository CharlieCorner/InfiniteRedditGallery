IRG.constants = (function(){
    
    var approvedDomains = function(){
        return ["imgur.com","i.imgur.com"];
    };

    var messages = {
        error: {
            aProblem : "There's been a problem!",
            noImagesFound: "No images were found."
        },
        info: {
            enterSubreddits: "Please enter your subreddits."
        }
    };

    return{
        approvedDomains: approvedDomains(),
        messages: messages
    };
})();

IRG.config = (function(){
    
})();