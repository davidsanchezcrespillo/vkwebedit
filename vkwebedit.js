function buildAppArea() {
  $.getJSON("controls.json", function( data ) {
    var items = [];
    console.log(data.controls);
    $.each(data.controls, function(key, val) {
      items.push( "<li id='cc" + val.code + "'>" + val.code + ": " + val.label + "</li>" );
    });
 
    $( "<ul/>", {
      "class": "controls",
      "id": "controls",
      html: items.join("")
    }).appendTo("#apparea");
  });
}

