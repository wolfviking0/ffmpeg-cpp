#pragma once

#include "Demuxing/StreamData.h"
#include "ffmpeg.h"

namespace ffmpegcpp {
class FrameWriter {
public:
  virtual ~FrameWriter() {}

  virtual void WriteFrame(int streamIndex, AVFrame *frame,
                          StreamData *metaData) = 0;

  virtual void Close(int streamIndex) = 0;

  virtual bool IsPrimed() = 0;
};

} // namespace ffmpegcpp
