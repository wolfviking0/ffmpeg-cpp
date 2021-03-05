#include <string>

#include "SimpleInterface.h"
#include "D.h"

int main() {
  void *handle = ffmpegCppCreate("out.mp4");
  ffmpegCppAddVideoStream(
      handle, (std::string(DATA_FOLDER) + "/big_buck_bunny.mp4").c_str());
  ffmpegCppAddVideoFilter(handle, "transpose=cclock[middle];[middle]vignette");
  ffmpegCppAddAudioStream(
      handle, (std::string(DATA_FOLDER) + "/big_buck_bunny.mp4").c_str());
  ffmpegCppGenerate(handle);
  ffmpegCppClose(handle);
}
