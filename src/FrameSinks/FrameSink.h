#pragma once

#include "ffmpeg.h"
#include "FrameSinkStream.h"

namespace ffmpegcpp
{
	class FrameSink
	{
	public:
        
        FrameSink() {}

		virtual FrameSinkStream* CreateStream() = 0;

		virtual AVMediaType GetMediaType() = 0;

		virtual ~FrameSink() {}
	};


}
