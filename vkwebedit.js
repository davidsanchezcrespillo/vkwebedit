var vkwebedit = function() {

  // All the outputs detected at application load time
  var outputs = [];


  /**
   * Build the application area, including controls.
   */
  var buildApp = function() {

    if (navigator.requestMIDIAccess) {
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

  /**
   * Send a patch to a MIDI output device.
   * The CC codes and the values are taken from the interface.
   */
  var sendPatch = function() {
    var output = getOutputFromInterface();

    $('input.cc-control').each(function(i) {
      var ccid = parseInt($(this).attr('data-id'));
      var ccvalue = parseInt($(this).val());

      var message = [0xB0, ccid, ccvalue];

      console.log(message);

      output.send(message);
    });
  };

  /**
   * Get the current patch data from the user interface.
   */
  function getCurrentPatchData() {
    var messagesList = [];
    $('input.cc-control').each(function(i) {
      var ccid = $(this).attr('data-id');
      var ccname = $(this).attr('data-name');
      var ccvalue = $(this).val();

      messagesList.push({
        "id": ccid,
        "name": ccname,
        "value": ccvalue
      });
    });

    return { messagesList };
  }

  /**
   * Save current patch in json format.
   */
  var savePatch = function() {
    var patchData = getCurrentPatchData();
    var data = "data:application/octet-stream;charset=utf-8;filename=patch.json," + encodeURIComponent(JSON.stringify(patchData));
    var filename = $('#patchname').val();
    $('#savepatch').attr('download', filename);
    $('#savepatch').attr('href', data);
  };

  /**
   * Load a patch in json format.
   */
  var loadPatch = function() {
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

    $("#midiOutputs").append(midiOutputs.join(""));
  }

  /**
   * Function executed on failed MIDI connection.
   */
  function onFailure(error) {
    console.log("Could not connect to the MIDI interface");
  }

  // Public interface.
  return {
    "buildApp": buildApp,
    "sendTestNote": sendTestNote,
    "sendPatch": sendPatch,
    "savePatch": savePatch,
    "loadPatch": loadPatch
  };

}();
