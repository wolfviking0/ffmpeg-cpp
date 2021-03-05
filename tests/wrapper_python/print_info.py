# -*- coding: utf-8 -*-
# Python3 support only
#

import os
import sys
import argparse


def main() -> int:

    try:
        import FfmpegCpp.FfmpegCpp as ffmpegcpp
    except ModuleNotFoundError:
        print("[ERROR] FfmpegCpp Not Found.")
        return 1

    # Load a video from a container and read its info.
    fileName = DATA_DIR + "/big_buck_bunny.mp4"

    demuxer = ffmpegcpp.Demuxer(fileName)
    info = demuxer.GetInfo()

    print("Input " + info.format.name + " from '" + fileName + "'")
    print("Video streams: ")
    i = 0
    for stream in info.videoStreams:
        out = "Stream #%d" % (i + 1)
        out += ": codec " + stream.codec.name
        out += ", pixel format " + stream.formatName
        out += ", resolution %dx%d" % (stream.width, stream.height)
        out += ", bit rate %fkb/s" % (stream.bitRate)
        out += ", fps %f" % (stream.frameRate.num / stream.frameRate.den)
        out += ", time base %d/%d" % (stream.timeBase.num, stream.timeBase.den)
        out += ", %d frames" % (demuxer.GetFrameCount(stream.id))
        print(out)
        i = i + 1

    print("Audio streams: ")
    i = 0
    for stream in info.audioStreams:
        out = "Stream #%d" % (i + 1)
        out += ": codec " + stream.codec.name
        out += ", channel layout " + stream.channelLayoutName
        out += ", channels %d" % (stream.channels)
        out += ", bit rate %fkb/s" % (stream.bitRate)
        out += ", sample rate %d" % (stream.sampleRate)
        out += ", time base %d/%d" % (stream.timeBase.num, stream.timeBase.den)
        out += ", %d frames" % (demuxer.GetFrameCount(stream.id))
        print(out)
        i = i + 1
    return 0


if __name__ == "__main__":
    try:
        install_index = sys.argv.index("--install") + 1
        install = sys.argv[install_index]
        data_index = sys.argv.index("--data") + 1
        DATA_DIR = sys.argv[data_index]
    except ValueError:
        pass

    sys.path.insert(0, os.path.abspath(os.path.join(install, 'python')))
    sys.exit(main())
