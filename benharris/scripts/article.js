'use strict';

// --------------------------------------------
// Article Object
// --------------------------------------------
function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// --------------------------------------------
// Article Methods
// --------------------------------------------

// COMMENT: Why isn't this method written as an arrow function?
// ** MY_ANSWER: Arrow functions alters the meaning/scope of 'contextual this', and as the function is associated with the prototype it requries an unaltered reference to contexual this in order to maniupalte information relating to 'this' object.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // ** MY_ANSWER: The question mark and colon represent a conditional (a.k.a. ternary) operator, where if the condition BEFORE the question mark is true it will run the code AFTER the question mark -- and if the condition BEFORE the question mark is false it will run the code AFTER the colon. 
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);
  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.
// REVIEW: This function will take the rawData, however it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.
// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// ** MY_ANSWER: The function 'Article.loadAll' is called in the Article.fetchAll function below. It is different from our previous labs because the data will be loaded into localStorage and made accessible for the app to reference at any time whereas beofre it had only been available via sessionStorage.

Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))
  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  // ** MY_ANSWER: The 'if' statement is checking to see if the rawData has been previously loaded into localStorage. If rawData is not in localStorage it will loadAll rawData into localStorage -- else it will simply loadAll data from localStorage.
  if (localStorage.rawData) {
    console.log('localStorage exists -- using prior data');
    Article.loadAll(JSON.parse(localStorage.rawData));
    articleView.initIndexPage();
  } else {
    console.log('localStorage does not exist -- initiating first data load');
    $.getJSON('data/hackerIpsum.json')
      .then(data => {
        Article.loadAll(data);
        localStorage.rawData = JSON.stringify(data);
        articleView.initIndexPage();
      }, err => {
        console.error(`Houston we have a problem \n ${err}`);
      });
  }
}
