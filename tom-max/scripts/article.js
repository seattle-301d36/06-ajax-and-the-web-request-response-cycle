'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}
let articleCache;
// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// The method refers to contextual 'this' which could mess with the scope intended.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // The questions mark and colon are part of a ternary operator. The question mark declares the ternary operator and the colon separates the return values based on what the ternary operator determines to be true about the statement. So, publishStatus will be set to the article's publishedOn value if it exists, and if it doesn't exist, it will be set to '(draft)'.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// The function is called within the fetchAll function. rawData represent the JSON file within local storage. Until now, we have been referencing a JS file with the data in it.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))
  console.log(articleData);
  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {
    if(articleCache !== $.ajax({url: './data/hackerIpsum.json', type: 'HEAD',cache: true,})){
      localStorage.clear();
      $.getJSON('./data/hackerIpsum.json') .then((rawData => {
        localStorage.setItem('rawData', JSON.stringify(rawData));
        Article.loadAll(JSON.parse(localStorage.getItem(`rawData`)));
        articleView.initIndexPage();
        }))
      }else{
    Article.loadAll(JSON.parse(localStorage.getItem(`rawData`)));
    articleView.initIndexPage();
    }}

   else {
    articleCache =  $.ajax({
    url: './data/hackerIpsum.json', 
    type: 'HEAD',
    cache: true,
    });
    console.log(articleCache);
    $.getJSON('./data/hackerIpsum.json') .then((rawData => {
      localStorage.setItem('rawData', JSON.stringify(rawData));
      Article.loadAll(JSON.parse(localStorage.getItem(`rawData`)));
      // for(let articleIndex in rawData) {
        // Article.loadAll(rawData[articleIndex]);
      articleView.initIndexPage();
      }
    ))
  }
}




