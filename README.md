# Reddit-Chat
An API using 190 million reddit comments. Based off of your text, an existing reddit comment will respond.

## Usage
Users get 60 requests per minute. Make a POST request to the url and a response body like so: 
```js
{ "text": "Hello there", "limit": 5 }
```
* limit is optional. Max of 20. Min of 1.