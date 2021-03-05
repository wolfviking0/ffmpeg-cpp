#pragma once

#include "FrameSinks/VideoFrameSink.h"
#include "Info/VideoStreamInfo.h"
#include "InputStream.h"
#include "ffmpeg.h"

namespace ffmpegcpp {
class VideoInputStream : public InputStream {

public:
  VideoInputStream(AVFormatContext *format, AVStream *stream);
  ~VideoInputStream();

  void AddStreamInfo(ContainerInfo *info);

protected:
  virtual void ConfigureCodecContext();
};
} // namespace ffmpegcpp
