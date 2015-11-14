IRG.constants = (function(){
    
    var approvedDomains = function(){
        return ["imgur.com", "i.imgur.com", "flickr.com",
            "m.imgur.com", "cdn.diycozyhome.com", "pbs.twimg.com", "msnbc.com",
            "fbcdn-sphotos-f-a.akamaihd.net", "flic.kr", "instagram.com", "deviantart.com",
            "s-media-cache-ak0.pinimg.com", "gfycat.com", "gifbeam.com", "staticflickr.com", "imgflip.com",
            "upload.wikimedia.org", "livememe.com"];
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