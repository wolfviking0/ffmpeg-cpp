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
