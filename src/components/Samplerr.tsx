import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import TimelineSlider from "../components/TimelineSlider"; // Assuming this is a React component

interface MidiAssignments {
  volume: number | null;
  bpm: number | null;
  sampleStart: number | null;
  sampleLength: number | null;
}

const WebAudioComponent: React.FC = () => {
  const [isLooping, setIsLooping] = useState(true);
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [bpmSliderValue, setBpmSliderValue] = useState(91.5);
  const [sampleLengthValue, setSampleLengthValue] = useState(0.0);
  const [sampleStartValue, setSampleStartValue] = useState(0);
  const [durationDisplay, setDurationDisplay] = useState(0);
  const [midiAvailable, setMidiAvailable] = useState(false);
  const [loopStarts, setLoopStarts] = useState([]);
  const [loopLengths, setLoopLengths] = useState([]);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  const sampleGridRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);
  const midiAssignments: MidiAssignments = {
    volume: null,
    bpm: null,
    sampleStart: null,
    sampleLength: null,
  };

  useEffect(() => {
    // Initialize Web Audio Controls script
    const script = document.createElement("script");
    script.src = "https://g200kg.github.io/webaudio-controls/webaudio-controls.js";
    document.head.appendChild(script);

    // MIDI listener setup
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess()
        .then((access) => {
          const inputs = access.inputs.values();
          for (let input of access.inputs.values()) {
            input.onmidimessage = handleMIDIMessage;
          }
          setMidiAvailable(true);
        })
        .catch((err) => {
          console.error("MIDI Access Failed:", err);
          setMidiAvailable(false);
        });
    } else {
      console.warn("WebMIDI not supported in this browser");
      setMidiAvailable(false);
    }

    // Cleanup MIDI listeners on component unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const handleLoadTrack = (url: string, imageUrl: string) => {
    playerRef.current = new Tone.Player({
      url: url,
      loop: isLooping,
    }).toDestination();

    playerRef.current.autostart = false;
    loadAndDrawImage(imageUrl);
    Tone.loaded().then(() => {
      setTrackLoaded(true);
      const sampleDuration = playerRef.current!.buffer.duration;
      // Additional logic
    });
  };

  const loadAndDrawImage = (imageUrl: string) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      fillGridWithImage(img);
    };
  };

  const fillGridWithImage = (img: HTMLImageElement) => {
    const numCols = 4;
    const numRows = 4;
    const canvasWidth = 100; // Match the CSS size
    const canvasHeight = 100; // Match the CSS size
    const imageAspectRatio = img.width / img.height;
    const gridAspectRatio = numCols * canvasWidth / (numRows * canvasHeight);
    let sx, sy, sWidth, sHeight;

    if (imageAspectRatio > gridAspectRatio) {
      sHeight = img.height;
      sWidth = img.height * gridAspectRatio;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = img.width / gridAspectRatio;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    for (let i = 0; i < numCols * numRows; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.id = i.toString();
      const ctx = canvas.getContext("2d");
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      const dx = col * canvasWidth;
      const dy = (numRows - 1 - row) * canvasHeight; // Reverse the row order

      ctx!.drawImage(
        img,
        sx + (col * sWidth) / numCols,
        sy + (row * sHeight) / numRows,
        sWidth / numCols,
        sHeight / numRows,
        0,
        0,
        canvasWidth,
        canvasHeight
      );
      if (sampleGridRef.current) {
        sampleGridRef.current.appendChild(canvas);
        canvas.addEventListener("mousedown", () => selectSample(i));
      }
    }
  };

  const selectSample = (index: number) => {
    if (sampleGridRef.current && sampleGridRef.current.children[index]) {
      const selectedCanvas = sampleGridRef.current.children[index] as HTMLCanvasElement;
      selectedCanvas.classList.add("selected");
      selectedCanvas.style.border = "2px solid yellow";
      updateLoopStart(0);
      updateLoopLength(1.0);
    }
  };

  const handleMIDIMessage = (event: WebMidi.MIDIMessageEvent) => {
    const data = event.data;
    const channel = data[0] & 0xf; // Get the MIDI channel (0-15)
    const command = data[0] & 0xf0; // Get the command
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 0;

    if (channel === 0 && command === 0x90 && velocity > 0) {
      const index = note - 36;
      selectSample(index);
    }
  };

  const adjustVolume = (value: number) => {
    if (playerRef.current) {
      playerRef.current.volume.value = value;
    }
  };

  const stopSample = () => {
    if (playerRef.current) {
      playerRef.current.stop();
    }
  };

  function updateLoopStart(value) {
    setSampleStartValue(value);
    playerRef.current!.loopStart = value;
    sessionStorage.setItem('loopStarts', JSON.stringify(loopStarts));
}

function updateLoopLength(value) {
    setSampleLengthValue(value);
    playerRef.current!.loopEnd = loopStarts[selectedSampleIndex] + value;
    sessionStorage.setItem('loopLengths', JSON.stringify(loopLengths));
}

  function format(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return `${minutes}:${seconds}`;
}
  function getPercentage(currentTime) {
    const percentage = (Math.floor(currentTime) / sampleLengthValue) * 100 + "%";
    return percentage;
}

  return (
    <div className="w-96 text-white/80 flex justify-center">
      <div className="flex flex-col sm:flex-row sm:gap-4 lg:flex-col">
        <div id="sampleGrid" ref={sampleGridRef} className="grid sm:w-1/2 lg:w-full"></div>
        <div className="sm:w-1/2 lg:w-full">
          {trackLoaded ? (
            <div className="controls">
              <small className="text-sm font-bold text-center font-mono p-1">
                startTime: {format(0)}
              </small>
              <small className="text-sm font-bold text-center font-mono p-1">
                Sample Length: {durationDisplay}
              </small>
              <label htmlFor="bpmSlider">BPM: {bpmSliderValue}</label>
              {midiAvailable && (
                <button onClick={() => {}}>
                  Listen for BPM
                </button>
              )}
              <TimelineSlider
                min={0}
                max={260}
                getPercentage={getPercentage}
                timeline={bpmSliderValue / 10}
                timeChange={adjustVolume}
                sliderValue={bpmSliderValue}
                thumbsliderImage="imageUrl"
                step={1}
              />
              <br />
              <label htmlFor="sampleLength" id="SampleLengthValue">
                Sample Length: {sampleLengthValue}
              </label>
              {midiAvailable && (
                <button onClick={() => {}}>
                  Listen for Sample Length
                </button>
              )}
              <TimelineSlider
                min={0}
                max={100}
                getPercentage={getPercentage}
                timeline={sampleLengthValue}
                timeChange={adjustVolume}
                sliderValue={sampleLengthValue}
                thumbsliderImage="imageUrl"
                step={0.1}
              />
              <br />
              <label htmlFor="sampleStart" id="sampleStartValue">
                Sample Start: {sampleStartValue}
              </label>
              {midiAvailable && (
                <button onClick={() => {}}>
                  Listen for Sample Start
                </button>
              )}
              <TimelineSlider
                min={0}
                max={100}
                getPercentage={getPercentage}
                timeline={sampleStartValue}
                timeChange={adjustVolume}
                sliderValue={sampleStartValue}
                thumbsliderImage="imageUrl"
                step={0.1}
              />
              <br />
              <div className="flex justify-between col-span-4 gap-4">
                <div className=" ">
                  <label className="loop-toggle">
                    <input
                      type="checkbox"
                      checked={isLooping}
                      onChange={(e) => setIsLooping(e.target.checked)}
                    />
                    Loop Sample
                  </label>
                </div>
                <div className="flex gap-2">
                  <button className="mx-auto" onClick={stopSample}>
                    🛑
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm font-bold text-center font-mono p-2">...Loading</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebAudioComponent;

