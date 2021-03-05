const fs = require('fs')
const path = require("path")

let INSTALL = undefined
let DATA_DIR = undefined

function main() {
    try
    {
        const ffmpegcpp = require(INSTALL+"FfmpegCpp.node")

        // Create a muxer that will output as MP3.
        const muxer = new ffmpegcpp.Muxer("output.mp3");

        // Create a MP3 codec that will encode the raw data.
        const codec = new ffmpegcpp.AudioCodec(ffmpegcpp.AV_CODEC_ID_MP3);

        // Create an encoder that will encode the raw audio data as MP3.
        // Tie it to the muxer so it will be written to the file.
        const encoder = new ffmpegcpp.AudioEncoder(codec, muxer);

        // Load the raw audio file so we can process it.
        // We need to provide some info because we can't derive it from the raw
        // format. Hand it the encoder so it will pass on its raw data to the
        // encoder, which will in turn pass it on to the muxer.
        const rawAudioFile = DATA_DIR + "/Vivaldi_s16le_2_channels_samplerate_11025.dat"
        const rawAudioFormat = "s16le";
        const rawAudioSampleRate = 11025;
        const rawAudioChannels = 2;
        const audioFile = new ffmpegcpp.RawAudioFileSource(rawAudioFile, rawAudioFormat, rawAudioSampleRate, rawAudioChannels, encoder);

        // Prepare the output pipeline. This will push a small amount of frames to
        // the file sink until it IsPrimed returns true.
        audioFile.PreparePipeline();

        // Push all the remaining frames through.
        while (!audioFile.IsDone()) {
          audioFile.Step();
        }

        // Save everything to disk by closing the muxer.
        muxer.Close();
    }
    catch (err)
    {
        console.error("Failed to run encode audio: " + err)
        return 1
    }

    return 0
}

if (__filename.indexOf(process.argv[1]) !== -1) {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++)
    {
        if (args[i] === "--install")
        {
            if (fs.existsSync(args[i+1]))
            {
                INSTALL = path.resolve(args[i+1]) + "/nodejs/FfmpegCpp/"
            }
        }
        if (args[i] === "--data")
        {
            if (fs.existsSync(args[i+1]))
            {
                DATA_DIR = path.resolve(args[i+1])
            }
        }
    }

    process.exit(main())
}
