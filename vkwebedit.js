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
         "label":"EG Sustain"
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

  if (navigator.requestMIDIAccess) {
    // Try to connect to the MIDI interface.
    navigator.requestMIDIAccess().then(onSuccess, onFailure);
  } else {
    console.log("Web MIDI API not supported!");
  }
}


// Function executed on successful connection
function onSuccess(interface) {

  var noteon,
      noteoff,
      outputs = [];

  console.log(interface);

  // Grab an array of all available devices
  var iter = interface.outputs.values();
  for (var i = iter.next(); i && !i.done; i = iter.next()) {
    outputs.push(i.value);
  }

  // Craft 'note on' and 'note off' messages (channel 3, note number 60 [C3], max velocity)
  noteon = [0x92, 60, 127];
  noteoff = [0x82, 60, 127];

  // Send the 'note on' and schedule the 'note off' for 1 second later
  outputs[0].send(noteon);
  setTimeout(
    function() {
      outputs[0].send(noteoff);
    },
    1000
  );

}

// Function executed on failed connection
function onFailure(error) {
  console.log("Could not connect to the MIDI interface");
}

