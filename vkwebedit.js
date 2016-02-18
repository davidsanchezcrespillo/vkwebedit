var vkwebedit = function() {

  // All the outputs detected at application load time
  var outputs = [];

  // CC codes for the Korg Volca Keys.
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

  /**
   * Build the interface for the CC controls.
   */
  function buildCCControls(controls) {
    var items = [];

    $.each(controls, function(key, val) {
      items.push(
        "<li id='licc" + val.code + "'>" + val.code + ": " + 
        "<label for='cc" + val.code + "'>" + val.label + "</label><input id='cc" + val.code + "' type='range' min='0' max='127' step='1' value='0'></li>"
      );
    });

    $("<ul/>", {
      "class": "controls",
      "id": "controls",
      html: items.join("")
    }).appendTo("#apparea");
  }

  /**
   * Build the application area, including controls.
   */
  var buildAppArea = function() {

    if (navigator.requestMIDIAccess) {
      // Build the controls
      buildCCControls(controls);
      // Try to connect to the MIDI interface.
      navigator.requestMIDIAccess().then(onSuccess, onFailure);
    } else {
      console.log("Web MIDI API not supported!");
      var helpText = "Could not connect to the MIDI interface. Please <a href='http://caniuse.com/#feat=midi'>check if your browser supports MIDI</a>";
      $("<p>", {
        "class": "alert alert-warning",
        html: helpText
      }).appendTo("#apparea");
    }
  };

  /**
   * Get the current output from the user interface.
   */
  function getOutputFromInterface() {
    var outputIndex = $('#midiOutputs').val();
    return outputs[outputIndex];
  }

  /**
   * Send a test note to a MIDI output device.
   *
   * @param output the output device to be used. If null, the selected device will be used
   */
  var sendTestNote = function(output) {
    if (output == null) {
      output = getOutputFromInterface();
    }

    if (output.send == null) {
      console.log("Cannot send to output " + output.name);
      return;
    }

    // Craft 'note on' and 'note off' messages (channel 1, note number 60 [C3], max velocity)
    noteon = [0x90, 60, 127];
    noteoff = [0x80, 60, 127];

    // Send the 'note on' and schedule the 'note off' for 1 second later
    output.send(noteon);
    setTimeout(
      function() {
        output.send(noteoff);
      },
      1000
    );
  };

  function getCCFromInterface() {
    var allMidiCcValues = [];

    $('#controls li').each(function(i) {
      var controlid = $(this).attr('id').replace("li", "");
      var ccid = parseInt(controlid.replace("cc", ""));

      var ccvalue = parseInt($('#' + controlid).val());

      var message = [0x1101, ccid, ccvalue];

      allMidiCcValues.push(message);
    });

    return allMidiCcValues;
  }

  /**
   * Send a patch to a MIDI output device.
   * The CC codes and the values are taken from the interface.
   */
  var sendPatch = function() {
    var output = getOutputFromInterface();

    $('#controls li').each(function(i) {
      var controlid = $(this).attr('id').replace("li", "");
      var ccid = parseInt(controlid.replace("cc", ""));

      var ccvalue = parseInt($('#' + controlid).val());

      var message = [0xB0, ccid, ccvalue];

      //alert(message);

      output.send(message);
    });
  };

  /**
   * Function executed on successful MIDI connection.
   */
  function onSuccess(interface) {
    var noteon,
      noteoff;
    var midiOutputs = [];

    console.log(interface);

    // Grab an array of all available devices
    var iter = interface.outputs.values();
    var numDevice = 0;
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
      outputs.push(i.value);
      midiOutputs.push("<option value='" + numDevice + "'>" + i.value.name + "</option>");
      console.log(i.value);
      numDevice++;
    }

    $("<select/>", {
      "id": "midiOutputs",
      "name": "midiOutputs",
      html: midiOutputs.join("")
    }).appendTo("#selectarea");
  }

  /**
   * Function executed on failed MIDI connection.
   */
  function onFailure(error) {
    console.log("Could not connect to the MIDI interface");
  }

  // Public interface.
  return {
    "buildAppArea": buildAppArea,
    "sendTestNote": sendTestNote,
    "sendPatch": sendPatch
  };

}();
