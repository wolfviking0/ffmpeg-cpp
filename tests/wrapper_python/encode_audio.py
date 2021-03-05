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

    # Create a muxer that will output as MP3.
    muxer = ffmpegcpp.Muxer("output.mp3")

    # Create a MP3 codec that will encode the raw data.
    codec = ffmpegcpp.AudioCodec(ffmpegcpp.AV_CODEC_ID_MP3)

    # Create an encoder that will encode the raw audio data as MP3.
    # Tie it to the muxer so it will be written to the file.
    encoder = ffmpegcpp.AudioEncoder(codec, muxer)

    # Load the raw audio file so we can process it.
    # We need to provide some info because we can't derive it from the raw
    # format. Hand it the encoder so it will pass on its raw data to the
    # encoder, which will in turn pass it on to the muxer.
    rawAudioFile = DATA_DIR + "/Vivaldi_s16le_2_channels_samplerate_11025.dat"
    rawAudioFormat = "s16le"
    rawAudioSampleRate = 11025
    rawAudioChannels = 2
    audioFile = ffmpegcpp.RawAudioFileSource(rawAudioFile, rawAudioFormat,
                                             rawAudioSampleRate, rawAudioChannels, encoder)

    # Prepare the output pipeline. This will push a small amount of frames to
    # the file sink until it IsPrimed returns true.
    audioFile.PreparePipeline()

    # Push all the remaining frames through.
    while not audioFile.IsDone():
        audioFile.Step()

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
