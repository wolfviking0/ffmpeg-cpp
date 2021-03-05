#pragma once
#include "VideoCodec.h"

namespace ffmpegcpp {

class H264Codec : public VideoCodec {

public:
  H264Codec();

  void SetPreset(const char *preset);
};

} // namespace ffmpegcpp