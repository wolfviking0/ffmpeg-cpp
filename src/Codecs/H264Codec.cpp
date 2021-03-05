#include "H264Codec.h"

namespace ffmpegcpp {

H264Codec::H264Codec() : VideoCodec("libx264") {}

void H264Codec::SetPreset(const char *preset) { SetOption("preset", preset); }
} // namespace ffmpegcpp
