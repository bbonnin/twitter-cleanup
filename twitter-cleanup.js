var Twitter = require('twitter');
var chalk = require('chalk');
var moment = require('moment');

var config = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

var client = new Twitter(config);

processFriends({ cursor: -1, count: 50 });

function processFriends(params) {
    client.get('friends/list', params, function(error, friends, response) {
        if (error) {
            console.log(error);
        }
        else {
            //console.log(friends.users.length);

            var sixMonthsAgo = moment().subtract(6, 'months');

            friends.users.forEach(user => {
                
                //console.log(user.name + ' - ' + user.screen_name 
                //    + ' - ' + (user.status ? user.status.created_at : 'NOSTATUS'));

                var toDelete = !user.status;

                if (!toDelete) {
                    var statusDate = moment(new Date(user.status.created_at));
                    toDelete = statusDate.isBefore(sixMonthsAgo);
                }

                if (toDelete) {
                    console.log('Unfollow ' + user.screen_name);
                    client.post('friendships/destroy', { screen_name: user.screen_name }, function(error, r, response) {
                        if (error) {
                            console.log(error);
                        }
                        console.log(r);
                        //console.log(response);
                    });
                }
            });

            if (friends.next_cursor != -1) {
                processFriends({ cursor: friends.next_cursor, count: 50 });
            } 
        }
    });
}
