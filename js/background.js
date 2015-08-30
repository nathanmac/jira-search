var $ = require('jquery');

var suggestions = [];

var defaults = {
    enabled: false,
    host: '',
    username: '',
    password: '',
    filterByUser: false
};

chrome.storage.sync.get(defaults, function (settings) { 

    console.log(settings);

    if (settings.enabled == true)
    {
        chrome.omnibox.onInputChanged.addListener(
            function (text, suggest) {

                if (text == '')
                    return;

                if (suggestions != []) {
                    suggest(suggestions);
                }

                $.ajaxSetup({
                    headers : {
                        'Authorization': 'Basic ' + btoa(settings.username + ':' + settings.password)
                    }
                });

                var url = settings.host + "rest/api/2/search";

                var jql = "(summary+~+%22" + text + "%22+or+description+~+%22" + text + "%22)";
                if (settings.filterByUser) {
                    jql += "+and+(assignee=%22" + settings.username + "%22+or+watcher=%22" + settings.username + "%22)";
                }

                url += "?jql=" + jql + "&maxResults=5";

                $.getJSON(url, function( data ) {
                    var items = [];

                    if (data.total && data.total > 0 && data.issues) {
                        $.each(data.issues, function (key, val) {
                            items.push({content: val.key, description: val.key + " - " + val.fields.summary});
                        });
                    }

                    suggestions = items;
                    suggest(items);
                });
            }
        );

        chrome.omnibox.onInputEntered.addListener(
            function (issue) {
                chrome.tabs.update({url: settings.host + "browse/" + issue});
            }
        );
    }    
});