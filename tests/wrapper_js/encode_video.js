const fs = require('fs')
const path = require("path")

let INSTALL = undefined
let DATA_DIR = undefined

function main() {
    try
    {
        const ffmpegcpp = require(INSTALL+"FfmpegCpp.node")

        const muxer = new ffmpegcpp.Muxer("output.mpg");

        // Create a MPEG2 codec that will encode the raw data.
        const codec = new ffmpegcpp.VideoCodec("mpeg2video");

        // Set the global quality of the video encoding. This maps to the command
        // line parameter -qscale and must be within range [0,31].
        codec.SetQualityScale(0);

        // Set the bit rate option -b:v 2M
        codec.SetGenericOption("b", "2M");

        // Create an encoder that will encode the raw audio data as MP3.
        // Tie it to the muxer so it will be written to the file.
        const encoder = new ffmpegcpp.VideoEncoder(codec, muxer);

        // Load the raw video file so we can process it.
        // FFmpeg is very good at deducing the file format, even from raw video
        // files, but if we have something weird, we can specify the properties of
        // the format in the constructor as commented out below.
        const videoFile = new ffmpegcpp.RawVideoFileSource(DATA_DIR + "/carphone_qcif.y4m", encoder);

        // Prepare the output pipeline. This will push a small amount of frames to
        // the file sink until it IsPrimed returns true.
        videoFile.PreparePipeline();

        // Push all the remaining frames through.
        while (!videoFile.IsDone()) {
            videoFile.Step();
        }

        // Save everything to disk by closing the muxer.
        muxer.Close();
    }
    catch (err)
    {
        console.error("Failed to run encode video: " + err)
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
