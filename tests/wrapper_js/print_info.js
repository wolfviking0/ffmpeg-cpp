const fs = require('fs')
const path = require("path")

let INSTALL = undefined
let DATA_DIR = undefined

function main() {
    try
    {
        const ffmpegcpp = require(INSTALL+"FfmpegCpp.node")

        // Load a video from a container and read its info.
        const fileName = DATA_DIR + "/big_buck_bunny.mp4"

        const demuxer = new ffmpegcpp.Demuxer(fileName);
        const info = demuxer.GetInfo();

        console.log("Input " + info.format.name + " from '" + fileName + "'")

        console.log("Video streams: ")
        for (let i = 0; i < info.videoStreams.size(); ++i)
        {
            const stream = info.videoStreams.get(i)
            console.log("Stream #" + (i + 1) + ": codec " + stream.codec.name
                    + ", pixel format " + stream.formatName + ", resolution "
                    + stream.width + "x" + stream.height + ", bit rate "
                    + stream.bitRate + "kb/s"
                    + ", fps "
                    + stream.frameRate.num / stream.frameRate.den
                    + ", time base " + stream.timeBase.num + "/"
                    + stream.timeBase.den + ", " + demuxer.GetFrameCount(stream.id)
                    + " frames"
            )
        }

        console.log("Audio streams: ")
        for (let i = 0; i < info.audioStreams.size(); ++i) {
            const stream = info.audioStreams.get(i);
            console.log("Stream #" + (i + 1) + ": codec " + stream.codec.name
                    + ", channel layout " + stream.channelLayoutName + ", channels "
                    + stream.channels + ", bit rate " + stream.bitRate + "kb/s"
                    + ", sample rate " + stream.sampleRate+ ", time base "
                    + stream.timeBase.num + "/" + stream.timeBase.den + ", "
                    + demuxer.GetFrameCount(stream.id) + " frames")
        }
    }
    catch (err)
    {
        console.error("Failed to run print info " + err)
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
