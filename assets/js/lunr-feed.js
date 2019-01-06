var hostname = "https://meikle.io";
var index = lunr(function () {
    this.field('title')
    this.field('content', {boost: 10})
    this.field('category')
    this.field('tags')
    this.ref('id')
});



    index.add({
      title: "Hello world",
      category: ["personal"],
      content: "\n    \n\n\nHello world! Please bear with me, I am just getting setup.\n",
      tags: ["personal"],
      id: 0
    });
    


var store = [{
    "title": "Hello world",
    "link": "/personal/helloworld.html",
    "image": null,
    "date": "January 6, 2019",
    "category": ["personal"],
    "excerpt": "\n    \n\n\nHello world! Please bear with me, I am just getting setup.\n"
}]

$(document).ready(function() {
    $('#search-input').on('keyup', function () {
        var resultdiv = $('#results-container');
        if (!resultdiv.is(':visible'))
            resultdiv.show();
        var query = $(this).val();
        var result = index.search(query);
        resultdiv.empty();
        $('.show-results-count').text(result.length + ' Results');
        for (var item in result) {
            var ref = result[item].ref;
            var searchitem = '<li><a href="'+ hostname + store[ref].link+'">'+store[ref].title+'</a></li>';
            resultdiv.append(searchitem);
        }
    });
});