const fs = require('fs')
const path = require("path")

let INSTALL = undefined
let DATA_DIR = undefined

function main() {
    try
    {
        const ffmpegcpp = require(INSTALL+"FfmpegCpp.node")
    }
    catch (err)
    {
        console.error("Failed to run decode audio: " + err)
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
