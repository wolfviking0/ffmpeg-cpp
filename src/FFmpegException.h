#pragma once

#include "ffmpeg.h"

#include "std.h"

namespace ffmpegcpp {
class FFmpegException : public std::exception {
public:
  /** Constructor (C strings).
   *  @param message C-style string error message.
   *                 The string contents are copied upon construction.
   *                 Hence, responsibility for deleting the char* lies
   *                 with the caller.
   */
  explicit FFmpegException(const char *message);

  /** Constructor (C++ STL strings).
   *  @param message The error message.
   */
  explicit FFmpegException(const std::string &message);

  /** Constructor (C++ STL strings).
   *  @param message The error message.
   *  @param message The return value.
   */
  explicit FFmpegException(const std::string &message, int returnValue);

  /** Destructor.
   * Virtual to allow for subclassing.
   */
  virtual ~FFmpegException() noexcept {}

  /** Returns a pointer to the (constant) error description.
   *  @return A pointer to a const char*. The underlying memory
   *          is in posession of the Exception object. Callers must
   *          not attempt to free the memory.
   */
  virtual const char *what() const noexcept { return msg_.c_str(); }

protected:
  /** Error message.
   */
  std::string msg_;
};
} // namespace ffmpegcpp