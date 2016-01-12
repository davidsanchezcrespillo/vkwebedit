function buildAppArea() {

  var controls = [
      {
         "code":5,
         "label":"Portamento"
      },
      {
         "code":11,
         "label":"Expression"
      },
      {
         "code":40,
         "label":"Voice"
      },
      {
         "code":41,
         "label":"Octave"
      },
      {
         "code":42,
         "label":"Detune"
      },
      {
         "code":43,
         "label":"VCO EG Int"
      },
      {
         "code":44,
         "label":"Cutoff"
      },
      {
         "code":45,
         "label":"VCF EG Int"
      },
      {
         "code":46,
         "label":"LFO Rate"
      },
      {
         "code":47,
         "label":"LFO Pitch Int"
      },
      {
         "code":48,
         "label":"LFO Cutoff Int"
      },
      {
         "code":49,
         "label":"EG Attack"
      },
      {
         "code":50,
         "label":"EG Decay/Release"
      },
      {
         "code":51,
         "label":"EG Sustan"
      },
      {
         "code":52,
         "label":"Delay Time"
      },
      {
         "code":53,
         "label":"Delay Feedback"
      }
  ];

  var items = [];
  console.log(controls);

  $.each(controls, function(key, val) {
      items.push( "<li id='cc" + val.code + "'>" + val.code + ": " + val.label + "</li>" );
  });

  $("<ul/>", {
    "class": "controls",
    "id": "controls",
    html: items.join("")
  }).appendTo("#apparea");
}

