/*!
{
  "name": "<%= detectName %>",
  "property": "<%= detectProperty %>",
  "notes": [{
    "name": "//Name of reference document",
    "href": "//URL of reference document"
  }]
}
!*/
/* DOC
<%= detectDoc %>
*/
define([<%= detectReqs.map(function(d){return "'" + d + "'"}).join(', ') %>], function( <%= detectReqs.join(', ') %> ) {
    Modernizr.addTest('<%= detectProperty %>', /* test goes here */ });
});
