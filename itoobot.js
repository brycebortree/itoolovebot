var _           = require('lodash');
var Client      = require('node-rest-client').Client;
var Twit        = require('twit');
var async       = require('async');
var wordFilter  = require('wordfilter');
var env         = require('dotenv').config();


var t = new Twit({
  consumer_key: env.CONSUMER_KEY,
  consumer_secret: env.CONSUMER_SECRET,
  access_token: env.ACESSS_TOKEN,
  access_token_secret: env.ACCESS_TOKEN_SECRET
});

var wordnikKey = env.WORDNIK_API_KEY

run = function() {
  async.waterfall([
    getPublicTweet,
    extractWordsFromTweet,
    getAllWordData,
    findAdjNouns,
    formatTweet,
    postTweet
  ],
  function(err, botData) {
    if (err) {
      console.log('There was an error posting to Twitter: ', err);
    } else {
      console.log('Tweet successful!');
      console.log('Tweet: ', botData.tweetBlock);
    }
    console.log('Base tweet: ', botData.baseTweet);
  });
}

getPublicTweet = function(cb) {
  t.get('search/tweets', {q: '\"I love\"', count: 1, result_type: 'recent', lang: 'en'}, function(err, data, response) {
    if (!err) {
      var botData = {
        baseTweet       : data.statuses[0].text.toLowerCase(),
        tweetID         : data.statuses[0].id_str,
        tweetUsername   : data.statuses[0].user.screen_name
      };
      cb(null, botData);
    } else {
      console.log("There was an error getting a public Tweet. Abandoning EVERYTHING :(");
      cb(err, botData);
    }
  });
};

extractWordsFromTweet = function(botData, cb) {
  var excludeNonAlpha       = /[^a-zA-Z]+/;
  var excludeURLs           = /https?:\/\/[-a-zA-Z0-9@:%_\+.~#?&\/=]+/g;
  var excludeShortAlpha     = /\b[a-z][a-z]?\b/g;
  var excludeHandles        = /@[a-z0-9_-]+/g;
  var excludePatterns       = [excludeURLs, excludeShortAlpha, excludeHandles];
  botData.tweet             = botData.baseTweet;

  _.each(excludePatterns, function(pat) {
    botData.tweet = botData.tweet.replace(pat, ' ');
  });

  botData.tweetWordList = botData.tweet.split(excludeNonAlpha);

  var excludedElements = ['and','the','pick','select','picking','much','love','your', 'just'];
  botData.tweetWordList = _.reject(botData.tweetWordList, function(w) {
    return _.includes(excludedElements, w);
  });

  cb(null, botData);
};

getAllWordData = function(botData, cb) {
  async.map(botData.tweetWordList, getWordData, function(err, results){
    botData.wordList = results;
    cb(err, botData);
  });
}

getWordData = function(word, cb) {
  var client = new Client();
  var wordnikWordURLPart1   = 'http://api.wordnik.com:80/v4/word.json/';
  var wordnikWordURLPart2   = '/definitions?limit=1&includeRelated=false&useCanonical=true&includeTags=false&api_key=';
  var args = {headers: {'Accept':'application/json'}};
  var wordnikURL = wordnikWordURLPart1 + word.toLowerCase() + wordnikWordURLPart2 + wordnikKey;

  client.get(wordnikURL, args, function (data, response) {
    if (response.statusCode === 200) {
      console.log(data);
      var result = data;
      if (result.length) {
        cb(null, result);
      } else {
        cb(null, null);
      }
    } else {
      cb(null, null);
    }
  });
};

findAdjNouns = function(botData, cb) {
  botData.adjList = [];
  botData.nounList = [];
  botData.wordList = _.compact(botData.wordList);

  _.each(botData.wordList, function(wordInfo) {
    var word            = wordInfo[0].word;
    var partOfSpeech    = wordInfo[0].partOfSpeech;

    if (partOfSpeech == 'noun' || partOfSpeech == 'proper-noun') {
      botData.nounList.push(word);
    }
    if(partOfSpeech === 'adjective'){
      botData.adjList.push(word);
    }
  });

  if (botData.nounList.length > 0 && botData.adjList.length > 0) {
    cb(null, botData);
  } else {
    cb('There is no adjective and/or noun.', botData);
  }
}


//continue working
getSynonyms = function(word, cb){
  var client = new Client();
  var wordnikWordURLPart1   = 'http://api.wordnik.com:80/v4/word.json/';
  var wordnikWordURLPart2   = '/relatedWords?limit=1&includeRelated=false&useCanonical=true&includeTags=false&api_key=';
  var args = {headers: {'Accept':'application/json'}};
  var wordnikURL = wordnikWordURLPart1 + word.toLowerCase() + wordnikWordURLPart2 + wordnikKey;

  client.get(wordnikURL, args, function (data, response) {
    if (response.statusCode === 200) {
      console.log(data);
      var result = data;
      if (result.length) {
        cb(null, result);
      } else {
        cb(null, null);
      }
    } else {
      cb(null, null);
    }
  });
};

getAllSynonyms = function(botData, cb) {
  async.map(botData.wordList, getWordData, function(err, results){
    botData.synonymList = results;
    cb(err, botData);
  });
}

formatTweet = function(botData, cb) {
  botData.adjNoun = [];
  _.each(botData.adjList.slice(0,1), function(word) {
    botData.adjNoun.push(word);
  });
  _.each(botData.nounList.slice(0,1), function(word) {
    botData.adjNoun.push(word);
  });

  var tweetLine1      = botData.adjNoun.join(' ');
  var username        = botData.tweetUsername;

  if(tweetLine1[tweetLine1.length - 1] === 's'){
    botData.tweetBlock = 'I, too, love ' + tweetLine1 + ', ' + username + '. ❤️'
  } else{
    botData.tweetBlock  = 'I, too, love ' + tweetLine1 + 's, ' + username + '. ❤️';
  }
  cb(null, botData);
}

postTweet = function(botData, cb) {
  console.log(botData);
  if (!wordFilter.blacklisted(botData.tweetBlock)) {
    t.post('statuses/update', {status: botData.tweetBlock}, function(err, data, response) {
      cb(err, botData);
    });
  }
}

run();

// setInterval(function() {
//   try {
//     run();
//   }
//   catch (e) {
//     console.log(e);
//   }
// }, 60000 * 10);