![I Too Bot in action](./ITooLoveBot.jpg?raw=true "I Too Bot in action")

# ITooLoveBot

A bot that scans tweets for the phrase "I love" and an adjective and noun. The bot then tweets, "I, too, love [adjective][noun]s, [user]."

## Bot in the Wild
[I Too Love Bot](http://twitter.com/ITooLoveBot)

### Prerequisities

You'll need:

* Node installed on your command line
* A Twitter account with its own phone number & API keys
* A Wordnik account & API key
* The itoobot.js file

### Installing

Feel free to clone this repo and edit the foustbot.js file to create your own Twitter poet bots. Edit the foustbot.js file's requests to the Wordnik API. Run from your command line using 

```
node itoobot.js
```

Then refine the random words and tweets you're making.

### Tweet Template
"I, too, love [adjective][noun]s, [user]."

## Deployment

This bot was deployed to Heroku with a simple Procfile and uses the Heroku scheduler to tweet every hour.

Procfile content: 
```
main: node itoobot.js
```

## Built With

* Twitter API - for searching and tweeting
* Wordnik API - helps us check for parts of speech and isolate adjectives and nouns
* NPM - to install various node packages that made the process much easier
* async - to create an array of separate functions called in order that pass along data to each other
* dotenv -  makes our env variables easier to bring in to our js
* lodash - simplifies and modularizes our Javascript for array and string iterations
* node-rest-client -returns API requests as JavaScript objects
* twit - a simple npm module that makes search and retweeting easier
* wordfilter - keeps our bot family friendly with a 'blacklist' of inappropriate language
* Heroku - for deployment
* Heroku Scheduler - to create a cron job

## Future Goals
* find overly fancy synonyms for adjectives and nouns
* refine the tweets so they no longer pluralize already plural nouns


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
* This bot was built using [ursooperduper](https://github.com/ursooperduper)'s [PickTwoBot](https://twitter.com/picktwobot) tutorial as base code
* Profile image and banner image for Twitter using [Unsplash](https://unsplash.com) images

