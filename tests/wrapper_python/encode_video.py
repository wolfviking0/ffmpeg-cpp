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

    muxer = ffmpegcpp.Muxer("output.mpg")

    # Create a MPEG2 codec that will encode the raw data.
    codec = ffmpegcpp.VideoCodec("mpeg2video")

    # Set the global quality of the video encoding. This maps to the command
    # line parameter -qscale and must be within range [0,31].
    codec.SetQualityScale(0)

    # Set the bit rate option -b:v 2M
    codec.SetGenericOption("b", "2M")

    # Create an encoder that will encode the raw audio data as MP3.
    # Tie it to the muxer so it will be written to the file.
    encoder = ffmpegcpp.VideoEncoder(codec, muxer)

    # Load the raw video file so we can process it.
    # FFmpeg is very good at deducing the file format, even from raw video
    # files, but if we have something weird, we can specify the properties of
    # the format in the constructor as commented out below.
    videoFile = ffmpegcpp.RawVideoFileSource(DATA_DIR + "/carphone_qcif.y4m", encoder)

    # Prepare the output pipeline. This will push a small amount of frames to
    # the file sink until it IsPrimed returns true.
    videoFile.PreparePipeline()

    # Push all the remaining frames through.
    while (not videoFile.IsDone()):
        videoFile.Step()

    # Save everything to disk by closing the muxer.
    muxer.Close()

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
