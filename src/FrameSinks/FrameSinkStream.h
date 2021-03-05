#pragma once

#include "Demuxing/StreamData.h"
#include "FrameWriter.h"
#include "ffmpeg.h"

namespace ffmpegcpp {
class FrameSinkStream {
public:
  FrameSinkStream(FrameWriter *frameSink, int streamIdx);

  void WriteFrame(AVFrame *frame, StreamData *metaData);

  void Close();

  bool IsPrimed();

private:
  FrameWriter *frameSink;
  int streamIndex;
};
} // namespace ffmpegcpp
