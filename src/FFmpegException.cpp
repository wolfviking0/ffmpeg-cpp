#include "FFmpegException.h"

using namespace std;

namespace ffmpegcpp {
FFmpegException::FFmpegException(const char *error) : msg_(error) {}

FFmpegException::FFmpegException(const string &error) : msg_(error.c_str()) {}

FFmpegException::FFmpegException(const string &error, int returnValue)
    : msg_(error + ": " +
           av_make_error_string((char*)error.c_str(), AV_ERROR_MAX_STRING_SIZE,
                                returnValue))

{}
} // namespace ffmpegcpp
