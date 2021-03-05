#pragma once

#include "FrameSinks/AudioFrameSink.h"
#include "InputStream.h"
#include "ffmpeg.h"

namespace ffmpegcpp {
class AudioInputStream : public InputStream {

public:
  AudioInputStream(AVFormatContext *format, AVStream *stream);
  ~AudioInputStream();

  void AddStreamInfo(ContainerInfo *info);

protected:
  virtual void ConfigureCodecContext();
};
} // namespace ffmpegcpp
